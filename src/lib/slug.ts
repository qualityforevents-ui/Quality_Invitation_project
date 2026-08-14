/**
 * Turning an Arabic name into a Latin URL slug.
 *
 * Arabic does not write short vowels, so "حمدي" is literally the four consonant
 * letters h, m, d, y. A character by character map produces "hmdy", which nobody
 * would recognise as their own name in a link they are about to send to three
 * hundred guests. There is no general fix for this without knowing how the word is
 * pronounced, so three things happen in order:
 *
 *   1. Names already typed in Latin script pass straight through. A large share of
 *      Egyptian customers type "Moaaz" and "Reem" themselves.
 *   2. A dictionary handles the common Egyptian first names, which is most real
 *      traffic, and gets them exactly right.
 *   3. Anything else falls back to a character map with a rule that breaks up an
 *      unpronounceable opening consonant cluster.
 *
 * The operator can change any slug from the admin, which is the backstop for the
 * cases these three steps get wrong.
 */

/** Common Egyptian given names, mapped to the spelling people actually use. */
const NAME_DICTIONARY: Record<string, string> = {
  محمد: 'mohamed',
  احمد: 'ahmed',
  محمود: 'mahmoud',
  مصطفى: 'mostafa',
  مصطفي: 'mostafa',
  علي: 'ali',
  عمر: 'omar',
  يوسف: 'youssef',
  خالد: 'khaled',
  كريم: 'karim',
  حسن: 'hassan',
  حسين: 'hussein',
  ابراهيم: 'ibrahim',
  عبدالله: 'abdullah',
  عبدالرحمن: 'abdelrahman',
  عبدالعزيز: 'abdelaziz',
  طارق: 'tarek',
  شريف: 'sherif',
  هيثم: 'haitham',
  وليد: 'walid',
  ياسر: 'yasser',
  ايمن: 'ayman',
  حمدي: 'hamdy',
  معاذ: 'moaaz',
  سيد: 'sayed',
  رامي: 'ramy',
  مينا: 'mina',
  جورج: 'george',
  بيتر: 'peter',
  مارك: 'mark',
  عمرو: 'amr',
  زياد: 'ziad',
  اسلام: 'islam',
  باسم: 'basem',
  تامر: 'tamer',
  هشام: 'hisham',
  سامح: 'sameh',
  ماجد: 'maged',
  نادر: 'nader',
  فادي: 'fady',
  فاطمة: 'fatma',
  مريم: 'mariam',
  نور: 'nour',
  ساره: 'sara',
  سارة: 'sara',
  ندى: 'nada',
  هبة: 'heba',
  دينا: 'dina',
  رانيا: 'rania',
  ياسمين: 'yasmin',
  منى: 'mona',
  امل: 'amal',
  ايمان: 'eman',
  شيماء: 'shaimaa',
  ريم: 'reem',
  حبيبة: 'habiba',
  ملك: 'malak',
  جنى: 'jana',
  لينا: 'lina',
  سلمى: 'salma',
  نادين: 'nadine',
  رنا: 'rana',
  هند: 'hend',
  اميرة: 'amira',
  داليا: 'dalia',
  يارا: 'yara',
  نرمين: 'nermine',
  عائشة: 'aisha',
  زينب: 'zeinab',
  اسماء: 'asmaa',
  رحمة: 'rahma',
  اية: 'aya',
  اسراء: 'esraa',
  نهى: 'noha',
  غادة: 'ghada',
  سمر: 'samar',
  هالة: 'hala',
  مها: 'maha',
  رشا: 'rasha',
  عليا: 'alia',
  فرح: 'farah',
  مي: 'may',
};

/** Diacritics, tatweel, and the other marks that carry no slug information. */
const ARABIC_MARKS =
  /[\u0610-\u061A\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0670\u0640]/g;

const LETTER_MAP: Record<string, string> = {
  ء: '',
  آ: 'a',
  أ: 'a',
  ؤ: 'o',
  إ: 'i',
  ئ: 'e',
  ا: 'a',
  ب: 'b',
  ة: 'a',
  ت: 't',
  ث: 's',
  ج: 'g',
  ح: 'h',
  خ: 'kh',
  د: 'd',
  ذ: 'z',
  ر: 'r',
  ز: 'z',
  س: 's',
  ش: 'sh',
  ص: 's',
  ض: 'd',
  ط: 't',
  ظ: 'z',
  ع: 'a',
  غ: 'gh',
  ف: 'f',
  ق: 'k',
  ك: 'k',
  ل: 'l',
  م: 'm',
  ن: 'n',
  ه: 'h',
  ى: 'a',
  ي: 'y',
  و: 'w',
  // Letters borrowed for foreign sounds.
  پ: 'p',
  چ: 'ch',
  ژ: 'zh',
  گ: 'g',
  ڤ: 'v',
};

const ARABIC_INDIC_DIGITS: Record<string, string> = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

/** Route segments and reserved words a public slug must never shadow. */
const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'build',
  'edit',
  'sample',
  'about',
  'terms',
  'privacy',
  'support',
  'help',
  'login',
  'logout',
  'static',
  'assets',
  'music',
  'images',
  'fonts',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'opengraph-image',
  'not-found',
  'qlty',
  'www',
]);

function stripMarks(input: string): string {
  return input.replace(ARABIC_MARKS, '');
}

function hasArabic(input: string): boolean {
  return /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/.test(input);
}

/**
 * Maps one Arabic word letter by letter.
 *
 * "و" and "ي" are both consonants and long vowels. Word initially they are almost
 * always consonants, elsewhere almost always vowels, which is close enough to right
 * to be worth encoding.
 */
function transliterateWord(word: string): string {
  const letters = [...word];
  let out = '';

  letters.forEach((letter, index) => {
    if (letter === 'و') {
      out += index === 0 ? 'w' : 'o';
      return;
    }
    if (letter === 'ي') {
      out += index === 0 ? 'y' : 'i';
      return;
    }
    if (letter in ARABIC_INDIC_DIGITS) {
      out += ARABIC_INDIC_DIGITS[letter];
      return;
    }
    if (letter in LETTER_MAP) {
      out += LETTER_MAP[letter];
      return;
    }
    out += letter;
  });

  return out;
}

/**
 * Arabic words do not begin with two consonants, so if the map produced one it is
 * standing in for a short vowel that the script never wrote down. Restoring an "a"
 * turns "hmdy" into "hamdy" and "gml" into "gamal". Later clusters are left alone,
 * because inserting there does more harm than good: "fatma" would become "fatama".
 */
function repairOpeningCluster(word: string): string {
  if (word.length < 2) return word;
  const first = word[0];
  const second = word[1];
  if (!VOWELS.has(first) && !VOWELS.has(second)) {
    return `${first}a${word.slice(1)}`;
  }
  return word;
}

function romaniseWord(word: string): string {
  const bare = stripMarks(word);
  if (!bare) return '';

  const dictionaryHit = NAME_DICTIONARY[bare];
  if (dictionaryHit) return dictionaryHit;

  // Names written with the definite article, e.g. "الهام", are rare in this field
  // but cheap to handle.
  if (bare.startsWith('ال') && bare.length > 3) {
    const withoutArticle = NAME_DICTIONARY[bare.slice(2)];
    if (withoutArticle) return withoutArticle;
  }

  if (!hasArabic(bare)) return bare;

  return repairOpeningCluster(transliterateWord(bare));
}

/** Lowercases, replaces everything that is not a letter or digit, collapses runs. */
function toSlugCase(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

/** Romanises one name, which may be several words. */
export function romaniseName(name: string): string {
  const words = stripMarks(name).split(/\s+/).filter(Boolean);
  const romanised = words.map(romaniseWord).join('-');
  return toSlugCase(romanised);
}

/**
 * Builds the base slug for a couple, e.g. "moaaz-reem".
 *
 * Only the first word of each name is used. Full names run long and the link is
 * meant to be readable in a WhatsApp message.
 */
export function buildSlugBase(name1: string, name2: string): string {
  const first = romaniseName(name1).split('-')[0] ?? '';
  const second = romaniseName(name2).split('-')[0] ?? '';

  const joined = [first, second].filter(Boolean).join('-');
  const cleaned = toSlugCase(joined);

  if (!cleaned || RESERVED_SLUGS.has(cleaned)) return 'invitation';
  return cleaned.slice(0, 60);
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

/** Validates a slug the operator typed by hand in the admin. */
export function isValidSlug(slug: string): boolean {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return false;
  if (slug.length < 2 || slug.length > 60) return false;
  return !RESERVED_SLUGS.has(slug);
}
