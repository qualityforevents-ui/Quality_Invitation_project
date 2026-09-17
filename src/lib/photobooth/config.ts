/**
 * What the photo booth is, what it costs and what we own.
 *
 * The same shape of file as src/lib/packages.ts and for the same reason: prices are an
 * edit and a deploy, never a migration, and a booking already taken keeps the price
 * recorded against it rather than silently repricing when this file changes.
 *
 * ────────────────────────────────────────────────────────────────────────────
 *  PRICES AND CAPACITY ARE REAL. NAMES, FEATURES AND IMAGES ARE NOT.
 *
 *  The price points, the deposit and the unit count below were read out of the
 *  live Notion Bookings database, which has been in daily use since July. They
 *  are what customers have actually paid.
 *
 *  What is still invented: what each tier is CALLED, what its feature list
 *  claims, how many hours it includes, the service areas, and every image path.
 *  `BOOTH_CONFIG_IS_PLACEHOLDER` stays true until those are confirmed, and the
 *  admin shows a warning on every booth screen while it is.
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

/**
 * How many jobs can run on one day. The hard ceiling on bookings per day.
 *
 * Two, from the live data rather than from a guess: 2026-08-28 carries both
 * "Mohamed & samiha" and "Mohamed & tasneem", and 2026-07-24 carries both
 * "Mahmoud & hadeer" and "Oldies". The business has already run two events in a day
 * twice, so a ceiling of one would have refused bookings it went on to accept.
 *
 * Confirm this is a real capacity and not two jobs that happened to be small. The
 * operator can change it from the admin settings screen without a deploy.
 */
export const BOOTH_UNIT_COUNT = 2;

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
 * The three tiers, priced from what customers have actually paid.
 *
 * Every figure here is a real price point out of the Notion database, and the ordering
 * is by how often it appears: 2999 is the most common booking by a distance, then 3500,
 * then 2000. 1500, 3700 and 4000 also exist in the history and are treated as
 * negotiated one offs rather than published tiers, which is what they look like.
 *
 * The feature lists are built from the add on columns the operator actually keeps:
 * PhotoBooth is ticked on nearly every booking, Guestbook on most, Audio Guestbook
 * occasionally. 360 Photo Booth and Plinker exist as columns and have never been
 * ticked, so they are not sold here yet.
 *
 * STILL TO CONFIRM: the names, the hours, and whether these inclusions are right. The
 * database records what was bought, not what was promised.
 */
export const BOOTH_PACKAGES: BoothPackageDefinition[] = [
  {
    id: 'BOOTH',
    price: 2000,
    hours: 4,
    extraHourPrice: 500,
    nameAr: 'الفوتوبوث',
    nameEn: 'Photo booth',
    taglineAr: 'الفوتوبوث وطباعة من غير عدد',
    taglineEn: 'The booth, and unlimited prints',
    featuresAr: [
      'فوتوبوث طول مدة الحجز',
      'طباعة فورية من غير عدد',
      'خلفية تختارها',
      'صندوق إكسسوارات',
      'فني معاكم طول الوقت',
      'ألبوم رقمي بكل الصور',
    ],
    featuresEn: [
      'The booth for the whole booking',
      'Unlimited instant prints',
      'A backdrop of your choosing',
      'A box of props',
      'An attendant with you throughout',
      'A digital gallery of every shot',
    ],
  },
  {
    id: 'BOOTH_GUESTBOOK',
    price: 2999,
    hours: 5,
    extraHourPrice: 500,
    nameAr: 'الفوتوبوث والجيست بوك',
    nameEn: 'Booth and guest book',
    taglineAr: 'الأكثر طلباً',
    taglineEn: 'What most people book',
    featuresAr: [
      'كل مميزات باقة الفوتوبوث',
      'جيست بوك بالصور المطبوعة',
      'ساعة زيادة',
    ],
    featuresEn: [
      'Everything in Photo booth',
      'A guest book of the printed photos',
      'An extra hour',
    ],
  },
  {
    id: 'BOOTH_FULL',
    price: 3500,
    hours: 5,
    extraHourPrice: 500,
    nameAr: 'الباقة الكاملة',
    nameEn: 'Everything',
    taglineAr: 'الفوتوبوث والجيست بوك والأوديو',
    taglineEn: 'Booth, guest book and audio',
    featuresAr: [
      'كل مميزات باقة الفوتوبوث والجيست بوك',
      'أوديو جيست بوك',
      'جيست بوك مصمم مخصوص',
    ],
    featuresEn: [
      'Everything in Booth and guest book',
      'An audio guest book',
      'A guest book designed for your event',
    ],
  },
];

const BOOTH_BY_ID = new Map(BOOTH_PACKAGES.map((p) => [p.id, p]));

export const DEFAULT_BOOTH_PACKAGE = 'BOOTH_GUESTBOOK';

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
 * What is taken up front to hold the date.
 *
 * A flat 500, not a percentage, because that is what the history shows: of the fifteen
 * deposits recorded, ten are exactly 500. The rest are 250, 350 and 1000, which look
 * like negotiations rather than a rule. A percentage would have quoted 600 on a 2000
 * booking and 1050 on a 3500 one, and neither is a number this business has ever asked
 * for.
 *
 * The admin can still record whatever was actually taken; this is only what the
 * website quotes.
 */
export const BOOTH_DEPOSIT = 500;

export function boothDeposit(price: number): number {
  // Never more than the booking itself, which would otherwise happen if a tier were
  // ever priced below the deposit.
  return Math.min(BOOTH_DEPOSIT, price);
}

/**
 * The tier nearest a given price.
 *
 * Needed because the operator's database records a price, not a package: a row typed in
 * by hand says "2999 EGP" and nothing about which tier that was. The admin still wants
 * a name to show, so the closest tier is used as a label while the real price is kept
 * exactly as it was recorded.
 */
export function matchPackageByPrice(price: number): BoothPackageDefinition {
  if (!price) return getBoothPackage(DEFAULT_BOOTH_PACKAGE);

  return BOOTH_PACKAGES.reduce((best, tier) =>
    Math.abs(tier.price - price) < Math.abs(best.price - price) ? tier : best,
  );
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
