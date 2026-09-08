import type { Lang } from '@/lib/types';

/**
 * The verses a customer may put on their card, and the option of none.
 *
 * A fixed set, like the music library and for a related reason: this is Qur'anic text,
 * and a free text field would let a typo in it be printed on three hundred people's
 * screens with no way to call it back. Four is the number the flow can show in full —
 * the whole verse, set in the face it will actually appear in — because nobody can
 * choose a verse from its name alone, and a picker that shows only surah references is
 * asking a question the customer cannot answer.
 *
 * VERIFY BEFORE THIS SHIPS. Every character below, tashkeel included, must be checked
 * against a printed mushaf by somebody qualified to do it. It is the one string in this
 * codebase where "looks right" is not a standard, and it is the one an error in would
 * matter most.
 */
export type Verse = {
  id: string;
  /** The verse as it appears on the card. */
  text: string;
  /** Surah and ayah, printed under the verse. */
  sourceAr: string;
  sourceEn: string;
  /** What the builder lists it as, above the text itself. */
  labelAr: string;
  labelEn: string;
};

/**
 * The answer "no verse at all", which is a real answer and not a missing one.
 *
 * It is an id rather than a null so that the stored row says which way the question was
 * answered. A null could not tell a customer who chose to have no verse apart from a
 * draft written before the question existed, and those two need different defaults.
 */
export const NO_VERSE_ID = 'none';

export const VERSES: Verse[] = [
  {
    id: 'ar-rum-21',
    text: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
    sourceAr: 'سورة الروم، الآية 21',
    sourceEn: 'Ar-Rum 21',
    labelAr: 'الروم ٢١',
    labelEn: 'Ar-Rum 21',
  },
  {
    id: 'al-furqan-74',
    text: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    sourceAr: 'سورة الفرقان، الآية 74',
    sourceEn: 'Al-Furqan 74',
    labelAr: 'الفرقان ٧٤',
    labelEn: 'Al-Furqan 74',
  },
  {
    id: 'an-nur-32',
    text: 'وَأَنكِحُوا الْأَيَامَىٰ مِنكُمْ وَالصَّالِحِينَ مِنْ عِبَادِكُمْ وَإِمَائِكُمْ إِن يَكُونُوا فُقَرَاءَ يُغْنِهِمُ اللَّهُ مِن فَضْلِهِ',
    sourceAr: 'سورة النور، الآية 32',
    sourceEn: 'An-Nur 32',
    labelAr: 'النور ٣٢',
    labelEn: 'An-Nur 32',
  },
  {
    id: 'adh-dhariyat-49',
    text: 'وَمِن كُلِّ شَيْءٍ خَلَقْنَا زَوْجَيْنِ لَعَلَّكُمْ تَذَكَّرُونَ',
    sourceAr: 'سورة الذاريات، الآية 49',
    sourceEn: 'Adh-Dhariyat 49',
    labelAr: 'الذاريات ٤٩',
    labelEn: 'Adh-Dhariyat 49',
  },
];

/** What a card carries when nobody has said otherwise. The commonest of the four. */
export const DEFAULT_VERSE_ID = VERSES[0].id;

const VERSES_BY_ID = new Map(VERSES.map((verse) => [verse.id, verse]));

/**
 * The chosen verse, or null when the customer asked for none.
 *
 * An unrecognised id falls back to the default rather than to none, which is the same
 * rule getTheme follows: a value nobody recognises is a bug in this code, and the right
 * response to it is the card everyone else gets, not a card silently missing a block.
 */
export function getVerse(id: string | null | undefined): Verse | null {
  if (id === NO_VERSE_ID) return null;
  if (id) {
    const found = VERSES_BY_ID.get(id);
    if (found) return found;
  }
  return VERSES_BY_ID.get(DEFAULT_VERSE_ID) ?? null;
}

/** True for the four ids and for `none`. What the API accepts. */
export function isValidVerseId(id: string): boolean {
  return id === NO_VERSE_ID || VERSES_BY_ID.has(id);
}

export function verseLabel(verse: Verse, lang: Lang): string {
  return lang === 'AR' ? verse.labelAr : verse.labelEn;
}

export function verseSource(verse: Verse, lang: Lang): string {
  return lang === 'AR' ? verse.sourceAr : verse.sourceEn;
}
