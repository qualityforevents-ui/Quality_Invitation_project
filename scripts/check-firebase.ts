/**
 * Confirms the service account in .env can reach the real project.
 *
 * Read-only, and deliberately ignores FIRESTORE_EMULATOR_HOST so it tests the thing
 * that actually matters in production rather than the emulator sitting on localhost.
 *
 * Run with: npx tsx scripts/check-firebase.ts
 */
import 'dotenv/config';

delete process.env.FIRESTORE_EMULATOR_HOST;

async function main() {
  const { invitations, reviews } = await import('../src/lib/db');

  const [inv, rev] = await Promise.all([
    invitations().count().get(),
    reviews().count().get(),
  ]);

  console.log('project    :', process.env.FIREBASE_PROJECT_ID);
  console.log('invitations:', inv.data().count);
  console.log('reviews    :', rev.data().count);
  console.log('credentials work.');
}

main().catch((error) => {
  console.error('FAILED:', error.message);
  process.exit(1);
});
