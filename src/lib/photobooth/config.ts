/**
 * What the photo booth is, what it costs and what we own.
 *
 * The same shape of file as src/lib/packages.ts and for the same reason: prices are an
 * edit and a deploy, never a migration, and a booking already taken keeps the price
 * recorded against it rather than silently repricing when this file changes.
 *
 * ────────────────────────────────────────────────────────────────────────────
 *  EVERY VALUE MARKED "PLACEHOLDER" IS A GUESS AND MUST BE REPLACED.
 *
 *  Nothing here was supplied by the business. The numbers are plausible rather
 *  than real, the ImageKit paths point at files that have not been uploaded, and
 *  `BOOTH_CONFIG_IS_PLACEHOLDER` below stays true until they are. While it is
 *  true the admin settings page shows a warning banner, so this cannot quietly
 *  ship and start quoting invented prices to customers.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { WHATSAPP_NUMBER } from '@/lib/constants';

/**
 * Flip to false once every PLACEHOLDER below has been replaced with a real value.
 *
 * Read by the admin, which refuses to look finished while this is true. It is one
 * boolean rather than a check of each field because the person replacing these is
 * working from a list, and the honest signal is "somebody has been through it", not
 * "no string still says PLACEHOLDER".
 */
export const BOOTH_CONFIG_IS_PLACEHOLDER = true;

/** PLACEHOLDER. How many booths exist. This is the hard ceiling on bookings per day. */
export const BOOTH_UNIT_COUNT = 1;

/**
 * PLACEHOLDER. How close to the event we will still take a booking.
 *
 * Counted in Cairo days: 2 means nothing today and nothing tomorrow. A booth has to be
 * loaded, driven and set up by people who need notice.
 */
export const BOOTH_MIN_NOTICE_DAYS = 2;

/** PLACEHOLDER. How far ahead the calendar opens. Beyond this, dates read as unavailable. */
export const BOOTH_MAX_ADVANCE_DAYS = 365;

/**
 * PLACEHOLDER. How long a booking holds a unit after the customer opens WhatsApp.
 *
 * This is the whole anti double booking mechanism on the customer's side: tapping
 * through to WhatsApp takes the unit off the calendar for this long, which is roughly
 * how long it takes a human to settle a deposit over a chat. Too short and a paying
 * customer loses their date while they find their banking app; too long and one
 * tyre kicker blocks a Saturday.
 */
export const BOOTH_HOLD_HOURS = 24;

/**
 * PLACEHOLDER. Weekdays we never work, as JavaScript day numbers (0 = Sunday).
 *
 * Empty because Egyptian weddings run every night of the week. Present so a closed day
 * is configuration rather than a code change.
 */
export const BOOTH_CLOSED_WEEKDAYS: number[] = [];

export type BoothPackageDefinition = {
  id: string;
  /** PLACEHOLDER price, EGP. */
  price: number;
  /** Hours of booth time included. */
  hours: number;
  /** PLACEHOLDER. EGP per hour beyond the included hours. */
  extraHourPrice: number;
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  taglineEn: string;
  featuresAr: string[];
  featuresEn: string[];
};

/**
 * PLACEHOLDER, all three tiers.
 *
 * Shaped after the invitation packages: a cheap entry, the one most people buy, and a
 * top tier. What each one includes is the part that most needs replacing, because it is
 * the part the customer is actually comparing.
 */
export const BOOTH_PACKAGES: BoothPackageDefinition[] = [
  {
    id: 'ESSENTIAL',
    price: 3500,
    hours: 2,
    extraHourPrice: 1000,
    nameAr: 'الأساسية',
    nameEn: 'Essential',
    taglineAr: 'الفوتوبوث وكل اللي معاه',
    taglineEn: 'The booth and everything with it',
    featuresAr: [
      'ساعتين تصوير',
      'طباعة فورية من غير عدد',
      'خلفية واحدة تختارها',
      'صندوق إكسسوارات',
      'فني معاكم طول الوقت',
      'ألبوم رقمي بكل الصور',
    ],
    featuresEn: [
      'Two hours of booth time',
      'Unlimited instant prints',
      'One backdrop of your choosing',
      'A box of props',
      'An attendant with you throughout',
      'A digital gallery of every shot',
    ],
  },
  {
    id: 'FULL_NIGHT',
    price: 5500,
    hours: 4,
    extraHourPrice: 1000,
    nameAr: 'الليلة كاملة',
    nameEn: 'Full night',
    taglineAr: 'من أول الفرح لآخره',
    taglineEn: 'From the first guest to the last',
    featuresAr: [
      'أربع ساعات تصوير',
      'كل مميزات الباقة الأساسية',
      'خلفيتين تختاروهم',
      'تصميم إطار مخصوص باسميكم',
      'الألبوم الرقمي في نفس الليلة',
    ],
    featuresEn: [
      'Four hours of booth time',
      'Everything in Essential',
      'Two backdrops of your choosing',
      'A print frame designed with your names on it',
      'The digital gallery the same night',
    ],
  },
  {
    id: 'SIGNATURE',
    price: 8000,
    hours: 5,
    extraHourPrice: 1200,
    nameAr: 'المميزة',
    nameEn: 'Signature',
    taglineAr: 'ركن تصوير متعمل ليكم انتم',
    taglineEn: 'A photo corner built around you',
    featuresAr: [
      'خمس ساعات تصوير',
      'كل مميزات باقة الليلة كاملة',
      'خلفية متعملة مخصوص لفرحكم',
      'ألبوم ضيوف بالصور المطبوعة',
      'فيديو قصير من الليلة',
    ],
    featuresEn: [
      'Five hours of booth time',
      'Everything in Full night',
      'A backdrop built for your event',
      'A guest book of the printed photos',
      'A short film from the night',
    ],
  },
];

const BOOTH_BY_ID = new Map(BOOTH_PACKAGES.map((p) => [p.id, p]));

export const DEFAULT_BOOTH_PACKAGE = 'FULL_NIGHT';

export function getBoothPackage(id: string | null | undefined): BoothPackageDefinition {
  if (id) {
    const found = BOOTH_BY_ID.get(id);
    if (found) return found;
  }
  return BOOTH_BY_ID.get(DEFAULT_BOOTH_PACKAGE) ?? BOOTH_PACKAGES[0];
}

export function isValidBoothPackage(id: string): boolean {
  return BOOTH_BY_ID.has(id);
}

/** The "from X EGP" on the home and the booth hero. Always the cheapest tier. */
export function boothStartingPrice(): number {
  return Math.min(...BOOTH_PACKAGES.map((p) => p.price));
}

/**
 * PLACEHOLDER. What is taken up front to hold the date, as a percentage of the price.
 *
 * A percentage rather than a flat figure so it stays proportionate across a 3500 and an
 * 8000 booking. Settled by a human over WhatsApp on InstaPay, exactly like an
 * invitation, which is why nothing in a browser is ever told the money arrived.
 */
export const BOOTH_DEPOSIT_PERCENT = 30;

export function boothDeposit(price: number): number {
  // Rounded to fifty so the customer is asked for a number a person would say out loud.
  return Math.round((price * BOOTH_DEPOSIT_PERCENT) / 100 / 50) * 50;
}

export type BoothArea = {
  id: string;
  nameAr: string;
  nameEn: string;
  /** PLACEHOLDER. EGP added for travel. Zero for the areas we already cover. */
  transportFee: number;
};

/** PLACEHOLDER. Where the booth goes, and what it costs to get there. */
export const BOOTH_AREAS: BoothArea[] = [
  { id: 'CAIRO', nameAr: 'القاهرة', nameEn: 'Cairo', transportFee: 0 },
  { id: 'GIZA', nameAr: 'الجيزة', nameEn: 'Giza', transportFee: 0 },
  { id: 'OTHER', nameAr: 'مكان تاني', nameEn: 'Somewhere else', transportFee: 1500 },
];

export function getBoothArea(id: string | null | undefined): BoothArea | null {
  return BOOTH_AREAS.find((a) => a.id === id) ?? null;
}

/**
 * The booth enquiry number.
 *
 * Falls back to the main number, which is almost certainly right: this is one business
 * with one phone. The variable exists so booth enquiries can be split off later without
 * a code change.
 */
export const BOOTH_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_BOOTH_NUMBER || WHATSAPP_NUMBER;

/**
 * PLACEHOLDER, every path. Nothing has been uploaded to ImageKit yet.
 *
 * These are paths inside the ImageKit endpoint, not full URLs, so the transform builder
 * can resize and reformat them. Anything still starting with the placeholder prefix
 * renders as a calm empty frame rather than a broken image: see BoothImage.
 */
export const BOOTH_MEDIA = {
  /** The one photo at the top of /photobooth, and the booth card on the home. */
  hero: 'PLACEHOLDER/booth/hero.jpg',
  /** Optional short muted loop for the home's booth card. Empty means use the photo. */
  heroVideo: '',
  /** PLACEHOLDER. Six to nine real shots from real events. */
  gallery: [
    'PLACEHOLDER/booth/gallery-1.jpg',
    'PLACEHOLDER/booth/gallery-2.jpg',
    'PLACEHOLDER/booth/gallery-3.jpg',
    'PLACEHOLDER/booth/gallery-4.jpg',
    'PLACEHOLDER/booth/gallery-5.jpg',
    'PLACEHOLDER/booth/gallery-6.jpg',
  ],
} as const;

/** PLACEHOLDER. The invitation card on the home wants a real photo too. */
export const INVITATIONS_MEDIA = {
  hero: 'PLACEHOLDER/invitations/hero.jpg',
} as const;

/** True for any media path nobody has replaced yet. */
export function isPlaceholderMedia(path: string): boolean {
  return path.length === 0 || path.startsWith('PLACEHOLDER');
}

/**
 * PLACEHOLDER. The Instagram strip on the home.
 *
 * Static images that link to the profile, deliberately not the embed script: that
 * script is third party JavaScript on the first paint of the home page, and it is
 * slower than the thing it renders is worth.
 */
export const INSTAGRAM_HANDLE = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || 'qlty.events';

export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;

export const INSTAGRAM_TILES: string[] = [
  'PLACEHOLDER/instagram/1.jpg',
  'PLACEHOLDER/instagram/2.jpg',
  'PLACEHOLDER/instagram/3.jpg',
  'PLACEHOLDER/instagram/4.jpg',
];
