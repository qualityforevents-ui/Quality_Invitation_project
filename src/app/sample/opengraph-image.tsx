import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og';
import { buildSampleView } from '@/lib/sample';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'qlty.events';

/**
 * The sample link gets shared too, and it doubles as the only way to see this renderer
 * without a live invitation in the database.
 */
export default async function SampleOgImage() {
  const view = buildSampleView('AR');

  return renderOgImage({
    name1: view.name1,
    name2: view.name2,
    eventType: view.eventType,
    eventDate: view.eventDate,
    venueName: view.venueName,
    lang: view.lang,
    themeId: view.themeId,
  });
}
