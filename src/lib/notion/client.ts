/**
 * A thin client for the Notion REST API.
 *
 * Deliberately not @notionhq/client. The official SDK's major versions are tied to API
 * versions, so adopting it would mean an npm upgrade every time Notion changes the
 * shape of a database, and the migration guide for the 2025-09-03 split says as much:
 * the SDK will not move until every call site has. What this integration actually needs
 * is four endpoints, a version header and a retry loop, which is this file.
 */

/**
 * The API version, pinned, in one place.
 *
 * 2025-09-03 is the version in which Notion split databases and data sources apart. A
 * database is now a container that holds one or more data sources, and the rows live in
 * the data source: the old POST /v1/databases/:id/query is gone, replaced by
 * POST /v1/data_sources/:id/query, and a page is created with a parent of
 * { type: 'data_source_id' } rather than { type: 'database_id' }. That is why the
 * environment asks for NOTION_BOOTH_DATA_SOURCE_ID and not a database id, and it is the
 * single most common way to wire this up wrong.
 *
 * Newer versions exist. Pinning is the point: an unpinned integration silently changes
 * behaviour on Notion's schedule rather than ours, and the failure would land as
 * bookings quietly not syncing. Moving this number is a deliberate act with a read of
 * the changelog behind it.
 */
export const NOTION_VERSION = '2025-09-03';

const NOTION_API = 'https://api.notion.com/v1';

export function isNotionConfigured(): boolean {
  return Boolean(process.env.NOTION_TOKEN && process.env.NOTION_BOOTH_DATA_SOURCE_ID);
}

export function boothDataSourceId(): string {
  return process.env.NOTION_BOOTH_DATA_SOURCE_ID ?? '';
}

export class NotionError extends Error {
  readonly status: number;
  readonly code: string | null;

  constructor(status: number, code: string | null, message: string) {
    super(message);
    this.name = 'NotionError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Notion allows roughly three requests a second, averaged.
 *
 * Requests are serialised through this promise chain with a minimum gap between them,
 * rather than fired in parallel and retried when they bounce. A reconcile pass can
 * touch a hundred pages, and a hundred parallel requests earn a 429 for every one of
 * them and then a retry storm on top. One at a time is fast enough for a job nobody is
 * waiting on, and it never gets the integration rate limited into a corner.
 *
 * Module scope, so it is per serverless instance rather than global. That is the honest
 * limitation: two instances running a reconcile at once would exceed the average. The
 * lock document in the reconcile endpoint is what stops that from happening.
 */
const MIN_GAP_MS = 350;
let queue: Promise<unknown> = Promise.resolve();
let lastCallAt = 0;

function serialise<T>(work: () => Promise<T>): Promise<T> {
  const result = queue.then(async () => {
    const wait = Math.max(0, lastCallAt + MIN_GAP_MS - Date.now());
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastCallAt = Date.now();
    return work();
  });

  // The chain must not break on a failure, or every later call inherits the rejection.
  queue = result.catch(() => undefined);
  return result;
}

const MAX_ATTEMPTS = 4;

/**
 * One request, retried on the failures that are worth retrying.
 *
 * 429 and 5xx are transient and get a backoff. Everything else — a 400 from a property
 * that does not exist, a 404 from a page somebody deleted, a 401 from a revoked token —
 * is a fact about the request, and retrying it four times only delays the moment
 * somebody finds out.
 *
 * `Retry-After` is honoured when Notion sends it, because a backoff we invented is a
 * guess and the one in the response is not.
 */
async function request<T>(
  path: string,
  init: { method: string; body?: unknown } = { method: 'GET' },
): Promise<T> {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new NotionError(0, 'not_configured', 'NOTION_TOKEN is not set');

  return serialise(async () => {
    let lastError: NotionError | null = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      const response = await fetch(`${NOTION_API}${path}`, {
        method: init.method,
        headers: {
          authorization: `Bearer ${token}`,
          'notion-version': NOTION_VERSION,
          'content-type': 'application/json',
        },
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
        // Notion is never the reason a page is cached or revalidated.
        cache: 'no-store',
      });

      if (response.ok) return (await response.json()) as T;

      const payload = (await response.json().catch(() => ({}))) as {
        code?: string;
        message?: string;
      };

      lastError = new NotionError(
        response.status,
        payload.code ?? null,
        payload.message ?? `Notion responded ${response.status}`,
      );

      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable || attempt === MAX_ATTEMPTS) throw lastError;

      const retryAfter = Number(response.headers.get('retry-after'));
      const backoff = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : 2 ** attempt * 250;

      await new Promise((resolve) => setTimeout(resolve, backoff));
    }

    throw lastError ?? new NotionError(0, null, 'Notion request failed');
  });
}

export type NotionPage = {
  id: string;
  created_time: string;
  last_edited_time: string;
  archived?: boolean;
  in_trash?: boolean;
  properties: Record<string, unknown>;
};

export function getPage(pageId: string): Promise<NotionPage> {
  return request<NotionPage>(`/pages/${pageId}`);
}

export function createPage(properties: Record<string, unknown>): Promise<NotionPage> {
  return request<NotionPage>('/pages', {
    method: 'POST',
    body: {
      // The 2025-09-03 shape. A database_id here is the single most common way to wire
      // this up wrong, and it fails with a message about the parent rather than a
      // message about the version.
      parent: { type: 'data_source_id', data_source_id: boothDataSourceId() },
      properties,
    },
  });
}

export function updatePage(
  pageId: string,
  properties: Record<string, unknown>,
): Promise<NotionPage> {
  return request<NotionPage>(`/pages/${pageId}`, {
    method: 'PATCH',
    body: { properties },
  });
}

export type QueryResult = {
  results: NotionPage[];
  next_cursor: string | null;
  has_more: boolean;
};

/**
 * Pages edited since a cursor, oldest first.
 *
 * Ascending on purpose. The cursor advances to the last page processed, so a run that
 * dies half way through has still moved the cursor past everything it did finish, and
 * the next run picks up from there rather than starting again. Sorted newest first, a
 * partial run would advance the cursor past pages it never looked at.
 */
export function queryEditedSince(
  since: string | null,
  cursor: string | null = null,
): Promise<QueryResult> {
  return request<QueryResult>(`/data_sources/${boothDataSourceId()}/query`, {
    method: 'POST',
    body: {
      ...(since
        ? { filter: { timestamp: 'last_edited_time', last_edited_time: { after: since } } }
        : {}),
      sorts: [{ timestamp: 'last_edited_time', direction: 'ascending' }],
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    },
  });
}
