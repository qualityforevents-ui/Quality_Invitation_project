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

/**
 * Whether a name is written in the script its invitation is set in.
 *
 * Only Arabic is enforced. An Arabic card must show Arabic letters, so a Latin name on
 * one is rejected rather than transliterated: مريم and ماريام are both plausible
 * readings of "mariam", and the only person who knows which is correct is the person
 * whose name it is. English cards are left alone, because an Arabic name written in
 * Arabic on an English card is a legitimate choice rather than a mistake.
 */
export function nameFitsLanguage(name: string, lang: 'AR' | 'EN'): boolean {
  if (lang !== 'AR') return true;
  if (name.trim().length === 0) return true;
  return hasArabicLetters(name);
}
