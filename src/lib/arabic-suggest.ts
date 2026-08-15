import { NAME_DICTIONARY } from './slug';
import { hasArabicLetters } from './script';

/**
 * Suggests an Arabic spelling for a name typed in Latin letters.
 *
 * This is a suggestion the customer taps to accept, never a conversion applied for
 * them, and that distinction carries the whole design. Latin spellings of Arabic names
 * are ambiguous: "mariam" is مريم to one family and ماريام to another, and no rule can
 * know which. What a rule can do is put a good candidate one tap away, so the person
 * whose name it is makes the call, and can edit the result if the candidate is close
 * but not theirs.
 *
 * Two passes. The dictionary in slug.ts already maps common Egyptian names to the
 * Latin spellings people actually use, so inverting it answers most real traffic
 * exactly. Anything else goes through a letter map that is deliberately modest: it
 * drops the vowels Arabic does not write, which lands "mazen" on مازن, and it will be
 * imperfect on unusual names, which is acceptable in a suggestion and unforgivable in
 * an automatic rewrite.
 */

/**
 * Latin to Arabic, inverted from the slug dictionary. Built once at module load.
 * Where two Arabic spellings share a Latin form, the first in the dictionary wins,
 * which was ordered with the more standard spelling first.
 */
const REVERSE_DICTIONARY: Map<string, string> = (() => {
  const map = new Map<string, string>();
  for (const [arabic, latin] of Object.entries(NAME_DICTIONARY)) {
    if (!map.has(latin)) map.set(latin, arabic);
  }
  return map;
})();

/** Digraphs first, or "sh" becomes س followed by ه. */
const DIGRAPHS: Array<[string, string]> = [
  ['kh', 'خ'],
  ['gh', 'غ'],
  ['sh', 'ش'],
  ['th', 'ث'],
  ['dh', 'ذ'],
  ['aa', 'ا'],
  ['ee', 'ي'],
  ['oo', 'و'],
  ['ou', 'و'],
  ['ai', 'اي'],
  ['ei', 'ي'],
];

const SINGLES: Record<string, string> = {
  b: 'ب',
  t: 'ت',
  g: 'ج',
  j: 'ج',
  d: 'د',
  r: 'ر',
  z: 'ز',
  s: 'س',
  f: 'ف',
  q: 'ق',
  k: 'ك',
  l: 'ل',
  m: 'م',
  n: 'ن',
  h: 'ه',
  w: 'و',
  y: 'ي',
  i: 'ي',
  o: 'و',
  u: 'و',
  p: 'ب',
  v: 'ف',
  c: 'ك',
  x: 'كس',
};

function transliterateWord(word: string): string {
  let rest = word;
  let out = '';
  let first = true;

  while (rest.length > 0) {
    const pair = DIGRAPHS.find(([latin]) => rest.startsWith(latin));
    if (pair) {
      out += pair[1];
      rest = rest.slice(pair[0].length);
      first = false;
      continue;
    }

    const letter = rest[0];
    rest = rest.slice(1);

    // Doubled consonants write once in Arabic; the shadda is a diacritic nobody types.
    if (rest[0] === letter) rest = rest.slice(1);

    if (letter === 'a') {
      // A Latin "a" is either a short vowel Arabic leaves unwritten, as in karim, or a
      // long alef, as in mazen. The dictionary already answers the common short vowel
      // names exactly, so by the time a name reaches this fallback the long reading is
      // the better bet: mazen becomes مازن rather than مزن.
      out += first ? 'أ' : 'ا';
      first = false;
      continue;
    }

    if (letter === 'e') {
      // Almost always a short vowel. Word initial it stands for a hamza seat.
      out += first ? 'إ' : '';
      first = false;
      continue;
    }

    out += SINGLES[letter] ?? '';
    first = false;
  }

  return out;
}

/**
 * The suggestion, or null when there is nothing sensible to offer.
 *
 * Multi word names are suggested word by word, so "mohamed ali" resolves both parts
 * through the dictionary rather than falling to the letter map because the whole
 * string missed.
 */
export function suggestArabicName(input: string): string | null {
  const cleaned = input.trim().toLowerCase();

  if (cleaned.length < 2) return null;
  if (hasArabicLetters(cleaned)) return null;
  if (!/[a-z]/.test(cleaned)) return null;

  const words = cleaned.split(/\s+/).map((word) => {
    const exact = REVERSE_DICTIONARY.get(word);
    if (exact) return exact;
    return transliterateWord(word.replace(/[^a-z]/g, ''));
  });

  const suggestion = words.filter(Boolean).join(' ');

  // A candidate that lost most of its letters is worse than no candidate.
  return suggestion.length >= 2 ? suggestion : null;
}
