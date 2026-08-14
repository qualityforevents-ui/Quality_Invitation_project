/**
 * The music library is fixed. Customers choose from it and can never upload audio,
 * because this product distributes whatever it serves at scale and a copyrighted
 * track would be a genuine takedown risk.
 *
 * Files live in /public/music and ship in the repo. They are a small fixed set of
 * licensed assets, not user content, so they need no external storage.
 *
 * See public/music/README.md for the encoding requirements and where to put files.
 */

export type MusicTrack = {
  id: string;
  /** Filename inside /public/music. */
  file: string;
  nameAr: string;
  nameEn: string;
  /** Shown under the name in the selector so the list reads as a spread of moods. */
  moodAr: string;
  moodEn: string;
};

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'oud-nights',
    file: 'oud-nights.mp3',
    nameAr: 'ليالي العود',
    nameEn: 'Oud Nights',
    moodAr: 'عود كلاسيكي، هادي',
    moodEn: 'Classical oud, calm',
  },
  {
    id: 'piano-vows',
    file: 'piano-vows.mp3',
    nameAr: 'وعد',
    nameEn: 'Vows',
    moodAr: 'بيانو ناعم',
    moodEn: 'Soft piano',
  },
  {
    id: 'strings-morning',
    file: 'strings-morning.mp3',
    nameAr: 'صباح الفرح',
    nameEn: 'Morning Strings',
    moodAr: 'وتريات خفيفة',
    moodEn: 'Light orchestral strings',
  },
  {
    id: 'modern-romance',
    file: 'modern-romance.mp3',
    nameAr: 'حكاية',
    nameEn: 'A Story',
    moodAr: 'رومانسي عصري',
    moodEn: 'Modern romantic',
  },
  {
    id: 'joyful-zaffa',
    file: 'joyful-zaffa.mp3',
    nameAr: 'زفة الفرح',
    nameEn: 'Joyful Zaffa',
    moodAr: 'إيقاع مبهج، مناسب للخطوبة',
    moodEn: 'Upbeat, suits engagements',
  },
  {
    id: 'baladi-wedding',
    file: 'baladi-wedding.mp3',
    nameAr: 'فرح بلدي',
    nameEn: 'Baladi Wedding',
    moodAr: 'مصري تقليدي',
    moodEn: 'Traditional Egyptian',
  },
  {
    id: 'qanun-serenade',
    file: 'qanun-serenade.mp3',
    nameAr: 'همس القانون',
    nameEn: 'Qanun Serenade',
    moodAr: 'قانون وناي، شرقي',
    moodEn: 'Qanun and ney, oriental',
  },
  {
    id: 'cinematic-forever',
    file: 'cinematic-forever.mp3',
    nameAr: 'للأبد',
    nameEn: 'Forever',
    moodAr: 'سينمائي واسع',
    moodEn: 'Cinematic, wide',
  },
];

export const DEFAULT_MUSIC_TRACK_ID = 'oud-nights';

const TRACKS_BY_ID = new Map(MUSIC_TRACKS.map((track) => [track.id, track]));

export function getTrack(id: string | null | undefined): MusicTrack {
  if (id) {
    const found = TRACKS_BY_ID.get(id);
    if (found) return found;
  }
  // An unknown id means a track was retired after an invitation chose it. Falling
  // back keeps that invitation playing rather than leaving it silent.
  return TRACKS_BY_ID.get(DEFAULT_MUSIC_TRACK_ID) ?? MUSIC_TRACKS[0];
}

export function isValidTrackId(id: string): boolean {
  return TRACKS_BY_ID.has(id);
}

export function trackUrl(track: MusicTrack): string {
  return `/music/${track.file}`;
}

export function trackName(track: MusicTrack, lang: 'AR' | 'EN'): string {
  return lang === 'AR' ? track.nameAr : track.nameEn;
}

export function trackMood(track: MusicTrack, lang: 'AR' | 'EN'): string {
  return lang === 'AR' ? track.moodAr : track.moodEn;
}
