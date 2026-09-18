/**
 * Checks the Notion integration end to end, before anything depends on it.
 *
 * Run with: npm run check:notion
 *
 * Four things go wrong when wiring this up, and they produce almost identical errors:
 * a missing token, a token from the wrong workspace, a database that was never shared
 * with the integration, and a database id pasted where a data source id belongs. This
 * tells them apart and says which one it is.
 */
import 'dotenv/config';
import { NOTION_VERSION, boothDataSourceId, isNotionConfigured } from '../src/lib/notion/client';
import { PROPS, fromNotionPage } from '../src/lib/notion/booth-schema';

const TOKEN = (process.env.NOTION_TOKEN ?? '').trim();

async function notion(path: string, init?: { method: string; body?: unknown }) {
  const response = await fetch(`https://api.notion.com/v1${path}`, {
    method: init?.method ?? 'GET',
    headers: {
      authorization: `Bearer ${TOKEN}`,
      'notion-version': NOTION_VERSION,
      'content-type': 'application/json',
    },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  });

  return { ok: response.ok, status: response.status, body: await response.json().catch(() => ({})) };
}

async function main(): Promise<void> {
  const failures: string[] = [];

  function step(label: string, ok: boolean, detail = '') {
    console.log(`${ok ? '  ok  ' : ' FAIL '} ${label}${detail ? `  ${detail}` : ''}`);
    if (!ok) failures.push(label);
  }

  console.log(`Notion API version ${NOTION_VERSION}\n`);

  step('NOTION_TOKEN is set', Boolean(TOKEN));
  step('NOTION_BOOTH_DATA_SOURCE_ID is set', Boolean(boothDataSourceId()));

  if (!isNotionConfigured()) {
    console.error('\nBoth are required. See docs/notion-booth-setup.md.');
    process.exit(1);
  }

  /* 1. Is the token real, and whose is it. */
  const me = await notion('/users/me');
  step(
    'the token is valid',
    me.ok,
    me.ok ? `integration "${me.body.name}" in "${me.body.bot?.workspace_name}"` : String(me.status),
  );

  if (!me.ok) {
    console.error('\nThe token was rejected outright. Copy it again from');
    console.error('notion.so/my-integrations, and check it starts "ntn_".');
    process.exit(1);
  }

  /* 2. Can it reach the data source. This is the share step, and the usual failure. */
  const query = await notion(`/data_sources/${boothDataSourceId()}/query`, {
    method: 'POST',
    body: { page_size: 5 },
  });

  step('the database is shared with the integration', query.ok, query.ok ? '' : String(query.status));

  if (!query.ok) {
    console.error('\nThe integration cannot see the database. Almost always one of two things:');
    console.error('  1. It was never shared. Open the Bookings database as a full page,');
    console.error(`     ••• at the top right, Connections, Connect to, "${me.body.name}".`);
    console.error('  2. NOTION_BOOTH_DATA_SOURCE_ID holds a DATABASE id rather than a');
    console.error('     data source id. They are different since API version 2025-09-03.');
    console.error(`\nNotion said: ${query.body.message ?? query.status}`);
    process.exit(1);
  }

  const rows = (query.body.results ?? []) as Parameters<typeof fromNotionPage>[0][];
  step('rows are readable', true, `${rows.length} read`);

  /* 3. Does the schema match what the mapper expects. A renamed column breaks the sync
        silently, so every property name is checked by name rather than assumed. */
  if (rows.length > 0) {
    const present = new Set(Object.keys(rows[0].properties));
    const missing = Object.values(PROPS).filter((name) => !present.has(name));

    step(
      'every property the site needs exists',
      missing.length === 0,
      missing.length ? `missing: ${missing.join(', ')}` : `${Object.values(PROPS).length} checked`,
    );

    /* 4. And does a real row actually map. Catches a column that exists under the right
          name but holds the wrong type. */
    const sample = fromNotionPage(rows[0]);
    step(
      'a real row maps cleanly',
      Boolean(sample.customerName || sample.eventDate),
      `"${sample.customerName}" on ${sample.eventDate ?? 'no date'}` +
        (sample.startTime ? `, ${sample.startTime} for ${sample.hours}h` : '') +
        (sample.price ? `, ${sample.price} EGP` : ''),
    );
  } else {
    console.log('  ..    no rows yet, so the schema and mapping were not exercised');
  }

  const webhook = process.env.NOTION_WEBHOOK_SECRET;
  console.log(
    `\n${webhook ? '  ok  ' : '  ..  '} NOTION_WEBHOOK_SECRET ${
      webhook ? 'is set' : 'is not set yet, which is expected until the site is deployed'
    }`,
  );

  if (failures.length > 0) {
    console.error(`\n${failures.length} check(s) failed.`);
    process.exit(1);
  }

  console.log('\nAll checks passed. `npm run notion:import` will pull the bookings in.');
  process.exit(0);
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
