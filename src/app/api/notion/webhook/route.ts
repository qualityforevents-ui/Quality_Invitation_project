import { NextResponse, after } from 'next/server';
import { boothSyncStateDoc } from '@/lib/db';
import { boothDataSourceId } from '@/lib/notion/client';
import { verifyNotionSignature } from '@/lib/notion/signature';
import { pullPageFromNotion } from '@/lib/notion/sync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Notion tells us a page changed.
 *
 * Three things make this endpoint safe to expose:
 *
 *   It answers in milliseconds. Notion retries a webhook that is slow to respond, and a
 *   retried webhook means the same page processed twice. The fetch and the upsert
 *   happen in `after()`, once the 200 is already on its way.
 *
 *   It verifies a signature on every request. The URL is public and the body is a
 *   page id; without the signature, anybody who learned the URL could make this site
 *   read and rewrite arbitrary Notion pages on our token.
 *
 *   It does nothing itself. Everything here funnels into pullPageFromNotion, which is
 *   the same path the reconcile job takes, so a webhook can never do something a
 *   scheduled run could not also do or undo.
 */

/** Only the events that can change a booking. Content edits inside a page cannot. */
const HANDLED = new Set([
  'page.created',
  'page.properties_updated',
  'page.deleted',
  'page.undeleted',
  'page.moved',
]);

type WebhookBody = {
  /** Present only on the one time handshake, never on a real event. */
  verification_token?: string;
  type?: string;
  entity?: { id?: string; type?: string };
  data?: { parent?: { id?: string; type?: string; data_source_id?: string } };
};

export async function POST(request: Request) {
  // The raw text, not the parsed object. The signature is over the exact bytes Notion
  // sent, and JSON.stringify of a parsed body is a different string often enough that
  // this is the classic reason a webhook signature never verifies.
  const raw = await request.text();

  let body: WebhookBody;
  try {
    body = JSON.parse(raw) as WebhookBody;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  /*
   * The one time handshake.
   *
   * When a subscription is created, Notion posts the verification token once, unsigned,
   * and waits for it to be pasted back into its own UI. There is nothing to verify
   * against yet, which is exactly why this branch exists and why it is logged rather
   * than acted on: the token is the secret that every later request is signed with.
   */
  if (body.verification_token) {
    console.log(
      '[notion/webhook] verification token received. Paste this into Notion to verify the ' +
        `subscription, then set NOTION_WEBHOOK_SECRET to it: ${body.verification_token}`,
    );
    return NextResponse.json({ ok: true });
  }

  const secret = process.env.NOTION_WEBHOOK_SECRET;
  if (!secret) {
    // Refused rather than trusted. An unverified webhook is an open endpoint that makes
    // this site read and write Notion on our token.
    console.error('[notion/webhook] NOTION_WEBHOOK_SECRET is not set, refusing the request');
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  if (
    !verifyNotionSignature({
      rawBody: raw,
      signature: request.headers.get('x-notion-signature'),
      secret,
    })
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const type = body.type ?? '';
  const pageId = body.entity?.id;

  if (!HANDLED.has(type) || body.entity?.type !== 'page' || !pageId) {
    return NextResponse.json({ ok: true, ignored: type });
  }

  /*
   * Only pages in the booth data source.
   *
   * The integration may be shared with other databases in the workspace, and a page
   * from a different one would be read as a booking with every field missing. Notion
   * puts the parent data source on the event, so this is a cheap check made before any
   * work happens.
   */
  const parentDataSource = body.data?.parent?.data_source_id ?? body.data?.parent?.id;
  const ours = boothDataSourceId().replace(/-/g, '');
  if (parentDataSource && ours && parentDataSource.replace(/-/g, '') !== ours) {
    return NextResponse.json({ ok: true, ignored: 'different data source' });
  }

  // Answer first. Everything below happens after the response has gone.
  after(async () => {
    try {
      await boothSyncStateDoc().set({ lastWebhookAt: new Date() }, { merge: true });
      const result = await pullPageFromNotion(pageId);
      console.log(`[notion/webhook] ${type} ${pageId}: ${result.action}`);
    } catch (error) {
      console.error(`[notion/webhook] failed to handle ${type} for ${pageId}`, error);
    }
  });

  return NextResponse.json({ ok: true });
}
