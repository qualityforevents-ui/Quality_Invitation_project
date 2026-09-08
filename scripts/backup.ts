/**
 * Writes every row this business cannot afford to lose into a timestamped JSON file
 * under ./backups.
 *
 * The Firestore free tier has no scheduled export. These documents hold wedding dates
 * and customer phone numbers, so losing them is not a recoverable event, and a restore
 * path that exists on day one is worth more than a better one written later.
 *
 * Run with: npm run backup
 *
 * Scheduling this is a decision only the operator can make, because it has to write
 * somewhere they control. SETUP.md covers the two practical options.
 */
// Loaded explicitly. Next.js reads .env by itself, but a plain tsx script does not, so
// without this the Admin SDK below throws "FIREBASE_PROJECT_ID is not set" on a machine
// where it is very much set.
import 'dotenv/config';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { invitations as invitationsCollection, reviews } from '../src/lib/db';

const BACKUP_DIR = path.resolve(process.cwd(), 'backups');

function stamp(): string {
  const now = new Date();
  const pad = (value: number) => value.toString().padStart(2, '0');
  return [
    now.getUTCFullYear(),
    pad(now.getUTCMonth() + 1),
    pad(now.getUTCDate()),
    '-',
    pad(now.getUTCHours()),
    pad(now.getUTCMinutes()),
  ].join('');
}

async function main() {
  console.log('Reading invitations from the database');

  const [invitationDocs, reviewDocs] = await Promise.all([
    invitationsCollection().orderBy('createdAt', 'asc').get(),
    reviews().orderBy('createdAt', 'asc').get(),
  ]);

  // Dumped as stored, with Timestamps turned into ISO strings so the file is readable
  // and restorable without the Admin SDK to decode it.
  const invitations = invitationDocs.docs.map((doc) => ({
    id: doc.id,
    ...JSON.parse(JSON.stringify(doc.data(), (_key, value) =>
      value && typeof value === 'object' && '_seconds' in value
        ? new Date(value._seconds * 1000).toISOString()
        : value,
    )),
  }));

  const reviewRows = reviewDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  const payload = {
    takenAt: new Date().toISOString(),
    schemaNote:
      'Document dump of the invitations and reviews collections. Restore by writing each document back under its own id.',
    counts: {
      invitations: invitations.length,
      reviews: reviewRows.length,
      byStatus: invitations.reduce<Record<string, number>>((acc, invitation) => {
        const status = String(invitation.status ?? 'UNKNOWN');
        acc[status] = (acc[status] ?? 0) + 1;
        return acc;
      }, {}),
    },
    reviews: reviewRows,
    invitations,
  };

  await mkdir(BACKUP_DIR, { recursive: true });

  const file = path.join(BACKUP_DIR, `qlty-backup-${stamp()}.json`);
  await writeFile(file, JSON.stringify(payload, null, 2), 'utf8');

  console.log(`Wrote ${invitations.length} invitations to ${file}`);
  console.log('Copy this file somewhere off this machine. A backup on one disk is not a backup.');
}

// Nothing to disconnect. Firestore is an HTTP client, so the process exits on its own
// once the writes are flushed, where the Postgres pool had to be closed by hand.
main().catch((error) => {
  console.error('Backup failed:', error);
  process.exitCode = 1;
});
