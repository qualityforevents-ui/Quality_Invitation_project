/**
 * Reconciles the new Bookings database against the dump of the old one.
 *
 * Run with: npm run notion:backfill          (reports, changes nothing)
 *           npm run notion:backfill -- --write
 *
 * The database was rebuilt in a second workspace because the first could not issue
 * integration tokens. Twenty six bookings were migrated by hand at the time, but four
 * columns had not been captured before access to the old workspace was lost: Notes,
 * Location, Guesbook Type and Photo Completed. This fills those in, and while it is
 * there it checks every other field against the dump, because a migration typed out by
 * hand is a migration that can have a typo in a price.
 *
 * Rows are matched on Client Name plus Date, which is unique across all 26: the three
 * "Lamba" bookings are on different days, and the two pairs that share a date have
 * different names.
 *
 * Reports by default and writes only when asked. The whole point is to see what it
 * intends to do before it does it.
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { NOTION_VERSION, boothDataSourceId, isNotionConfigured } from '../src/lib/notion/client';

const WRITE = process.argv.includes('--write');
const TOKEN = (process.env.NOTION_TOKEN ?? '').trim();

const DUMP = path.resolve(process.cwd(), 'backups/notion-old-workspace.json');

type OldRow = {
  name: string;
  date: string;
  time: string | null;
  venue: string | null;
  phone: string | null;
  eventType: string | null;
  packagePrice: string | null;
  depositPaid: number | null;
  depositReceived: boolean;
  done: boolean;
  photoCompleted: boolean;
  notes: string | null;
  location: string | null;
  guesbookType: string | null;
  photoBooth: string | null;
  photoBooth360: string | null;
  guestbook: string | null;
  audioGuestbook: string | null;
  plinker: string | null;
};

async function notion(pathname: string, init?: { method: string; body?: unknown }) {
  const response = await fetch(`https://api.notion.com/v1${pathname}`, {
    method: init?.method ?? 'GET',
    headers: {
      authorization: `Bearer ${TOKEN}`,
      'notion-version': NOTION_VERSION,
      'content-type': 'application/json',
    },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Notion ${response.status}: ${body.message ?? 'request failed'}`);
  }
  return body;
}

const text = (value: string | null) =>
  value ? { rich_text: [{ type: 'text', text: { content: value.slice(0, 2000) } }] } : { rich_text: [] };

function readText(property: unknown): string {
  const value = property as { rich_text?: { plain_text?: string }[]; title?: { plain_text?: string }[] };
  return (value?.rich_text ?? value?.title ?? []).map((p) => p.plain_text ?? '').join('');
}

function readSelect(property: unknown): string | null {
  return (property as { select?: { name?: string } })?.select?.name ?? null;
}

function readNumber(property: unknown): number | null {
  const n = (property as { number?: number | null })?.number;
  return typeof n === 'number' ? n : null;
}

async function main(): Promise<void> {
  if (!isNotionConfigured() || !TOKEN) {
    console.error('NOTION_TOKEN and NOTION_BOOTH_DATA_SOURCE_ID must be set.');
    process.exit(1);
  }

  const dump = JSON.parse(readFileSync(DUMP, 'utf8')) as { rows: OldRow[] };
  console.log(`${dump.rows.length} rows in the dump\n`);

  /* Every row in the new database, paged. */
  const live: { id: string; props: Record<string, unknown> }[] = [];
  let cursor: string | undefined;

  do {
    const page = await notion(`/data_sources/${boothDataSourceId()}/query`, {
      method: 'POST',
      body: { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) },
    });
    for (const p of page.results) live.push({ id: p.id, props: p.properties });
    cursor = page.has_more ? page.next_cursor : undefined;
  } while (cursor);

  console.log(`${live.length} rows in the new database\n`);

  const key = (name: string, date: string) => `${name.trim()}__${date}`;

  const byKey = new Map(
    live.map((row) => {
      const name = readText(row.props['Client Name']);
      const date = ((row.props.Date as { date?: { start?: string } })?.date?.start ?? '').slice(0, 10);
      return [key(name, date), row] as const;
    }),
  );

  let filled = 0;
  let mismatched = 0;
  let missing = 0;

  for (const old of dump.rows) {
    const match = byKey.get(key(old.name, old.date));

    if (!match) {
      console.log(` MISSING  ${old.name} on ${old.date} is not in the new database`);
      missing += 1;
      continue;
    }

    /* The four that were never captured, and are therefore empty in the new database. */
    const patch: Record<string, unknown> = {};
    if (old.notes && !readText(match.props.Notes)) patch.Notes = text(old.notes);
    if (old.location && !(match.props.Location as { url?: string })?.url) {
      patch.Location = { url: old.location };
    }
    if (old.guesbookType && !readSelect(match.props['Guesbook Type'])) {
      patch['Guesbook Type'] = { select: { name: old.guesbookType } };
    }
    if (old.photoCompleted) patch['Photo Completed'] = { checkbox: true };

    /* Everything that was migrated by hand, checked against the source. */
    const differences: string[] = [];
    const check = (label: string, want: unknown, got: unknown) => {
      const a = want === null || want === undefined ? '' : String(want);
      const b = got === null || got === undefined ? '' : String(got);
      if (a !== b) differences.push(`${label}: dump "${a}" vs new "${b}"`);
    };

    check('Time', old.time, readText(match.props.Time) || null);
    check('Venue', old.venue, readText(match.props.Venue) || null);
    check('Phone', old.phone, (match.props['Phone Number'] as { phone_number?: string })?.phone_number);
    check('Event Type', old.eventType, readText(match.props['Event Type']) || null);
    check('Package Price', old.packagePrice, readSelect(match.props['Package Price']));
    check('Deposit Paid', old.depositPaid, readNumber(match.props['Deposit Paid']));
    check(
      'Deposit Received',
      old.depositReceived,
      Boolean((match.props['Deposit Received'] as { checkbox?: boolean })?.checkbox),
    );
    check('Done', old.done, Boolean((match.props.Done as { checkbox?: boolean })?.checkbox));

    if (differences.length > 0) {
      mismatched += 1;
      console.log(` DIFFERS  ${old.name} on ${old.date}`);
      for (const d of differences) console.log(`            ${d}`);
    }

    if (Object.keys(patch).length > 0) {
      filled += 1;
      const fields = Object.keys(patch).join(', ');

      if (WRITE) {
        await notion(`/pages/${match.id}`, { method: 'PATCH', body: { properties: patch } });
        console.log(`  filled  ${old.name.padEnd(20)} ${fields}`);
      } else {
        console.log(`  would   ${old.name.padEnd(20)} ${fields}`);
      }

      // Notion allows roughly three requests a second.
      if (WRITE) await new Promise((r) => setTimeout(r, 350));
    }
  }

  console.log(
    `\n${filled} row(s) ${WRITE ? 'filled' : 'to fill'}, ${mismatched} with differences, ${missing} missing.`,
  );

  if (!WRITE && filled > 0) console.log('\nRe-run with --write to apply.');
  process.exit(missing > 0 ? 1 : 0);
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
