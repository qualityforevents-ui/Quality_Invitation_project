/**
 * Pulls every booking that already exists in Notion into Firestore, once.
 *
 * Run with: npm run notion:import
 *
 * For the moment before launch when the operator has been keeping bookings in a Notion
 * database by hand and the site is about to start writing to the same one. Without this
 * the site would know nothing about those dates, the public calendar would offer every
 * one of them, and the first thing the new booking system would do is double book a
 * Saturday that was already sold.
 *
 * Safe to run more than once. Every page goes through the same pullPageFromNotion the
 * webhook uses, which matches on the Notion page id first and the booking id second, so
 * a second run updates what it imported rather than creating it again.
 */
import 'dotenv/config';
import { isNotionConfigured, queryEditedSince } from '../src/lib/notion/client';
import { pullPageFromNotion } from '../src/lib/notion/sync';
import { boothSyncStateDoc } from '../src/lib/db';

async function main(): Promise<void> {
  if (!isNotionConfigured()) {
    console.error(
      'NOTION_TOKEN and NOTION_BOOTH_DATA_SOURCE_ID must both be set. See docs/notion-booth-setup.md.',
    );
    process.exit(1);
  }

  const counts = { created: 0, updated: 0, cancelled: 0, ignored: 0, failed: 0 };
  let cursor: string | null = null;
  let newest: string | null = null;
  let page = 0;

  do {
    // No `since`, so this asks for everything rather than what changed.
    const result = await queryEditedSince(null, cursor);

    for (const notionPage of result.results) {
      try {
        const outcome = await pullPageFromNotion(notionPage.id);
        counts[outcome.action] += 1;

        console.log(
          `${outcome.action.padEnd(10)} ${notionPage.id}` +
            ('reason' in outcome ? `  (${outcome.reason})` : ''),
        );
      } catch (error) {
        counts.failed += 1;
        console.error(`failed     ${notionPage.id}`, error);
      }

      newest = notionPage.last_edited_time;
    }

    cursor = result.has_more ? result.next_cursor : null;
    page += 1;
  } while (cursor && page < 100);

  /*
   * Leaves the cursor where the import finished.
   *
   * Without this the first scheduled run after an import would walk the entire database
   * again from the beginning, which is slow, pointlessly rate limited, and writes a
   * history entry for every booking it re-examines.
   */
  if (newest) {
    await boothSyncStateDoc().set(
      { lastIncrementalCursor: newest, lastIncrementalRunAt: new Date() },
      { merge: true },
    );
  }

  console.log('\n' + JSON.stringify(counts, null, 2));
  process.exit(counts.failed > 0 ? 1 : 0);
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
