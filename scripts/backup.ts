/**
 * Writes every row this business cannot afford to lose into a timestamped JSON file
 * under ./backups.
 *
 * The free Supabase plan has no backups at all. This table holds wedding dates and
 * customer phone numbers, so losing it is not a recoverable event, and a restore path
 * that exists on day one is worth more than a better one written later.
 *
 * Run with: npm run backup
 *
 * Scheduling this is a decision only the operator can make, because it has to write
 * somewhere they control. SETUP.md covers the two practical options.
 */
// Loaded explicitly. Next.js and the Prisma CLI read .env by themselves, but a plain
// tsx script does not, so without this the client below throws "DATABASE_URL is not
// set" on a machine where it is very much set.
import 'dotenv/config';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../src/lib/db';

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

  const [invitations, heartbeat] = await Promise.all([
    prisma.invitation.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.heartbeat.findUnique({ where: { id: 1 } }),
  ]);

  const payload = {
    takenAt: new Date().toISOString(),
    schemaNote:
      'Row dump of the Invitation table. Restore with scripts/restore.ts or by hand through Prisma.',
    counts: {
      invitations: invitations.length,
      byStatus: invitations.reduce<Record<string, number>>((acc, invitation) => {
        acc[invitation.status] = (acc[invitation.status] ?? 0) + 1;
        return acc;
      }, {}),
    },
    heartbeat,
    invitations,
  };

  await mkdir(BACKUP_DIR, { recursive: true });

  const file = path.join(BACKUP_DIR, `qlty-backup-${stamp()}.json`);
  await writeFile(file, JSON.stringify(payload, null, 2), 'utf8');

  console.log(`Wrote ${invitations.length} invitations to ${file}`);
  console.log('Copy this file somewhere off this machine. A backup on one disk is not a backup.');
}

main()
  .catch((error) => {
    console.error('Backup failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
