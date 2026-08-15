/**
 * Whether a string contains Arabic letters.
 *
 * Used to notice when an Arabic invitation is carrying Latin names, which is allowed but
 * usually not what the couple intended.
 */
const ARABIC_LETTERS = /[ء-يٮ-ۓۺ-ۿ]/;

export function hasArabicLetters(text: string): boolean {
  return ARABIC_LETTERS.test(text);
}

