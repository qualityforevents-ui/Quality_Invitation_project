/**
 * The tashkeel and Quranic marks, which are combining characters. A name typed with
 * them, "مُعَاذ", begins with م followed by a damma, so taking the first character
 * without stripping these can hand back a floating vowel mark instead of a letter.
 *
 * Written as escapes rather than as the characters themselves. These marks are
 * invisible or near invisible in an editor, so a range typed literally can silently
 * cover far more than intended: one careless boundary here swallows U+0621 to U+064A,
 * which is every Arabic letter, and the function then returns nothing at all for every
 * Arabic name.
 */
const COMBINING_MARKS =
  /[\u0610-\u061A\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0670\u0640]/g;

/**
 * The first letter of a name, for the monogram.
 *
 * Iterates by code point rather than by index, because a name may open with a
 * character outside the basic plane and `name[0]` would return half of it.
 */
export function initialOf(name: string): string {
  const stripped = name.replace(COMBINING_MARKS, '').trim();
  return [...stripped][0] ?? '';
}
