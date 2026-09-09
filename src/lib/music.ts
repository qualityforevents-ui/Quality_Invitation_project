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
    id: 'fostanek-al-abyad',
    file: 'fostanek-al-abyad.mp3',
    nameAr: 'حسين الجسمي - فستانك الأبيض',
    nameEn: 'Hussain Al Jassmi - Fostanek Al Abyad',
    moodAr: 'رومانسي، زفة العروسة',
    moodEn: 'Romantic bridal entrance',
  },
  {
    id: 'el-leila',
    file: 'el-leila.mp3',
    nameAr: 'عمرو دياب - الليلة',
    nameEn: 'Amr Diab - El Leila',
    moodAr: 'حماسي، فرح واحتفال',
    moodEn: 'Upbeat celebration',
  },
  {
    id: 'ya-lela-beda',
    file: 'ya-lela-beda.mp3',
    nameAr: 'شيرين - يا ليلة بيضا',
    nameEn: 'Sherine - Ya Lela Beda',
    moodAr: 'طربي مبهج، ليلة العمر',
    moodEn: 'Celebratory tarab',
  },
  {
    id: 'elfarh-malena',
    file: 'elfarh-malena.mp3',
    nameAr: 'حماده هلال - الفرح مالينا',
    nameEn: 'Hamada Helal - Elfarh Malena',
    moodAr: 'فرحة وبهجة مصرية',
    moodEn: 'Joyful Egyptian wedding',
  },
  {
    id: 'hatgawz',
    file: 'hatgawz.mp3',
    nameAr: 'سعد الصغير - هتجوز',
    nameEn: 'Saad El Soghayar - Hatgawz',
    moodAr: 'شعبي مصري، رقص وفرفشة',
    moodEn: 'Egyptian shaabi, dance',
  },
];

export const DEFAULT_MUSIC_TRACK_ID = 'fostanek-al-abyad';
export const NO_MUSIC_TRACK_ID = 'none';

const TRACKS_BY_ID = new Map(MUSIC_TRACKS.map((track) => [track.id, track]));

/** Backward-compatibility aliases for earlier track ids. */
const TRACK_ALIASES: Record<string, string> = {
  'oud-nights': 'ya-lela-beda',
  'piano-vows': 'fostanek-al-abyad',
  'strings-morning': 'fostanek-al-abyad',
  'cinematic-forever': 'fostanek-al-abyad',
  'qanun-serenade': 'ya-lela-beda',
  'baladi-wedding': 'hatgawz',
  'modern-romance': 'el-leila',
  'joyful-zaffa': 'elfarh-malena',
};

export function getTrack(id: string | null | undefined): MusicTrack | null {
  if (id === NO_MUSIC_TRACK_ID) return null;
  if (id) {
    const resolvedId = TRACK_ALIASES[id] ?? id;
    const found = TRACKS_BY_ID.get(resolvedId);
    if (found) return found;
    // An unknown id means a track was retired after an invitation chose it. Falling
    // back keeps that invitation playing rather than leaving it silent.
    return TRACKS_BY_ID.get(DEFAULT_MUSIC_TRACK_ID) ?? MUSIC_TRACKS[0];
  }
  return null;
}

export function isValidTrackId(id: string): boolean {
  return id === NO_MUSIC_TRACK_ID || TRACKS_BY_ID.has(id) || id in TRACK_ALIASES;
}

export function trackUrl(track: MusicTrack | null): string {
  if (!track) return '';
  return `/music/${encodeURIComponent(track.file)}`;
}

export function trackName(track: MusicTrack | null, lang: 'AR' | 'EN'): string {
  if (!track) return lang === 'AR' ? 'بدون موسيقى' : 'No music';
  return lang === 'AR' ? track.nameAr : track.nameEn;
}

export function trackMood(track: MusicTrack | null, lang: 'AR' | 'EN'): string {
  if (!track) return lang === 'AR' ? 'تفتح الدعوة في هدوء تام' : 'Invitation opens in silence';
  return lang === 'AR' ? track.moodAr : track.moodEn;
}

