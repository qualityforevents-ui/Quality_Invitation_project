/**
 * Reports which music files are present and whether they fit the delivery budget.
 *
 * Run with: npm run check:music
 */
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { MUSIC_TRACKS } from '../src/lib/music';

/** Guests open these on mobile data. See public/music/README.md. */
const MAX_BYTES = 1.5 * 1024 * 1024;

async function main() {
  const musicDir = path.resolve(process.cwd(), 'public', 'music');

  let missing = 0;
  let oversized = 0;

  for (const track of MUSIC_TRACKS) {
    const file = path.join(musicDir, track.file);

    try {
      const info = await stat(file);
      const mb = info.size / (1024 * 1024);

      if (info.size > MAX_BYTES) {
        oversized += 1;
        console.log(`OVER BUDGET  ${track.file.padEnd(24)} ${mb.toFixed(2)} MB, limit is 1.50 MB`);
      } else {
        console.log(`ok           ${track.file.padEnd(24)} ${mb.toFixed(2)} MB`);
      }
    } catch {
      missing += 1;
      console.log(`MISSING      ${track.file.padEnd(24)} ${track.nameEn}`);
    }
  }

  console.log('');
  if (missing === 0 && oversized === 0) {
    console.log(`All ${MUSIC_TRACKS.length} tracks present and within budget.`);
    return;
  }

  if (missing > 0) {
    console.log(`${missing} of ${MUSIC_TRACKS.length} tracks are missing.`);
    console.log('Invitations still open, they just open silently. See public/music/README.md.');
  }
  if (oversized > 0) {
    console.log(`${oversized} track(s) are too large. Re encode with the ffmpeg command in the README.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
