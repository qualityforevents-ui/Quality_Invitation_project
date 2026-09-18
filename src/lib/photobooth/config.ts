/**
 * What the photo booth is, what it costs and what we own.
 *
 * The same shape of file as src/lib/packages.ts and for the same reason: prices are an
 * edit and a deploy, never a migration, and a booking already taken keeps the price
 * recorded against it rather than silently repricing when this file changes.
 *
 * Everything here is real. The price, the offer, the add ons, the deposit, the unit
 * count and every photograph were supplied by the business or read out of the live
 * Notion database. The one remaining guess is the transport fee for an event outside
 * Cairo and Giza, which is marked where it sits.
 */

import { WHATSAPP_NUMBER } from '@/lib/constants';

/**
 * Whether anything customer facing is still invented.
 *
 * False now: prices, deposit, capacity and photographs are all real. The admin stops
 * warning on every booth screen. Turn it back on if a placeholder is ever reintroduced.
 */
export const BOOTH_CONFIG_IS_PLACEHOLDER = false;

/**
 * One booth.
 *
 * There is a second unit, rented out to a friend, and it is deliberately not counted
 * here: it is not reliably ours to sell. So the website sells one night at a time, and
 * a day that is already taken is not a dead end — see BOOTH_FULL_DAY_IS_NEGOTIABLE.
 */
export const BOOTH_UNIT_COUNT = 1;

/**
 * A booked day is worth a conversation rather than a closed door.
 *
 * With one booth, a confirmed Saturday closes the calendar. But the second unit exists,
 * and a date can sometimes be made to work by borrowing it, moving hours, or a
 * cancellation. So a full day stays tappable and offers WhatsApp instead of refusing,
 * and the copy is careful to promise a conversation rather than a booth.
 *
 * The calendar still refuses to *book* a full day. Nothing here weakens the transaction
 * that stops two customers taking one booth; it only changes what a customer is told
 * when they land on a day that has gone.
 */
export const BOOTH_FULL_DAY_IS_NEGOTIABLE = true;

/**
 * How close to the event we will still take a booking online.
 *
 * Counted in Cairo days: 2 means nothing today and nothing tomorrow. Anything closer is
 * still possible, it just goes through WhatsApp rather than the form.
 */
export const BOOTH_MIN_NOTICE_DAYS = 2;

/** How far ahead the calendar opens. Beyond this, dates read as unavailable. */
export const BOOTH_MAX_ADVANCE_DAYS = 365;

/**
 * How long a booking holds the booth after the customer opens WhatsApp.
 *
 * This is the whole anti double booking mechanism on the customer's side. Too short and
 * a paying customer loses their date while they find their banking app; too long and
 * one tyre kicker blocks a Saturday. A day matches how long a deposit conversation
 * actually takes.
 */
export const BOOTH_HOLD_HOURS = 24;

/** Weekdays we never work, as JavaScript day numbers (0 = Sunday). Egyptian weddings
    run every night, so this is empty and exists so a closed day is configuration. */
export const BOOTH_CLOSED_WEEKDAYS: number[] = [];

export type BoothPackageDefinition = {
  id: string;
  /** What the customer pays today. */
  price: number;
  /**
   * The standard rate, shown struck through beside the offer. Null hides it entirely.
   *
   * Only ever set this to a price the business genuinely charges when the offer is not
   * running. A reference price that was never charged is a misleading one, and in most
   * places an illegal one.
   */
  listPrice: number | null;
  hours: number;
  extraHourPrice: number;
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  taglineEn: string;
  featuresAr: string[];
  featuresEn: string[];
};

/**
 * One package, not three.
 *
 * The business sells a single thing — six hours of coverage with everything in it — and
 * the variations are add ons rather than tiers. Three invented tiers were three ways to
 * describe one offer, and a price list with one row is both the truth and the easier
 * page to read.
 */
export const BOOTH_PACKAGES: BoothPackageDefinition[] = [
  {
    id: 'FULL_EVENT',
    price: 2995,
    listPrice: 6000,
    hours: 6,
    /*
     * Six hours covers an entire Egyptian wedding, so nobody has ever needed a seventh.
     * The figure exists because the booking form lets somebody ask for more hours, and
     * it must quote something rather than nothing.
     */
    extraHourPrice: 500,
    nameAr: 'تغطية الفرح كامل',
    nameEn: 'Full event coverage',
    taglineAr: 'ست ساعات، وكل حاجة معاها',
    taglineEn: 'Six hours, everything included',
    featuresAr: [
      'ست ساعات تغطية للفرح',
      'طباعة فورية من غير عدد',
      'جيست بوك عادي',
      'كل الصور بجودتها على موقعنا برابط بعد الفرح',
      'فني معاكم طول الوقت',
    ],
    featuresEn: [
      'Six hours of event coverage',
      'Unlimited instant prints',
      'A standard guest book',
      'Every photo at full quality, as a link on our site after the event',
      'An attendant with you throughout',
    ],
  },
];

const BOOTH_BY_ID = new Map(BOOTH_PACKAGES.map((p) => [p.id, p]));

export const DEFAULT_BOOTH_PACKAGE = 'FULL_EVENT';

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

/** The "from X EGP" on the home and the booth hero. */
export function boothStartingPrice(): number {
  return Math.min(...BOOTH_PACKAGES.map((p) => p.price));
}

/* ------------------------------------------------------------------- add ons */

export type BoothAddOn = {
  id: string;
  price: number;
  nameAr: string;
  nameEn: string;
  noteAr: string;
  noteEn: string;
};

/**
 * The two things that can be added to the package.
 *
 * Both are real products with real prices. They are add ons rather than a second tier
 * because that is how they are actually sold: a customer books the package and then
 * decides about the guest book.
 */
export const BOOTH_ADD_ONS: BoothAddOn[] = [
  {
    id: 'CUSTOM_GUESTBOOK',
    price: 600,
    nameAr: 'جيست بوك مصمم مخصوص',
    nameEn: 'Custom guest book',
    noteAr: 'بدل الجيست بوك العادي اللي في الباقة، متصمم على فرحكم.',
    noteEn: 'Replaces the standard guest book, designed around your event.',
  },
  {
    id: 'AUDIO_GUESTBOOK',
    price: 500,
    nameAr: 'أوديو جيست بوك',
    nameEn: 'Audio guest book',
    noteAr: 'ضيوفك بيسجلوا رسايل صوتية، وتستلمها كلها بعد الفرح.',
    noteEn: 'Guests record voice messages, and you get every one after the event.',
  },
];

const ADD_ON_BY_ID = new Map(BOOTH_ADD_ONS.map((a) => [a.id, a]));

export function getBoothAddOn(id: string): BoothAddOn | null {
  return ADD_ON_BY_ID.get(id) ?? null;
}

/** Only the ids this file knows, so a crafted form post cannot invent a discount. */
export function sanitiseAddOns(ids: readonly string[]): BoothAddOn[] {
  const seen = new Set<string>();
  const chosen: BoothAddOn[] = [];

  for (const id of ids) {
    if (seen.has(id)) continue;
    const addOn = ADD_ON_BY_ID.get(id);
    if (!addOn) continue;
    seen.add(id);
    chosen.push(addOn);
  }

  return chosen;
}

export function addOnsTotal(addOns: readonly BoothAddOn[]): number {
  return addOns.reduce((total, addOn) => total + addOn.price, 0);
}

/* ------------------------------------------------------------------ deposit */

/**
 * What is taken up front to hold the date. A flat figure, not a percentage.
 *
 * 500 on every booking regardless of size, which is both what the business says and
 * what its history shows: ten of the fifteen recorded deposits are exactly 500.
 *
 * Settled by a human on WhatsApp, which is why nothing in a browser is ever told the
 * money arrived.
 */
export const BOOTH_DEPOSIT = 500;

export function boothDeposit(price: number): number {
  // Never more than the booking itself, which could only happen if a package were ever
  // priced below the deposit.
  return Math.min(BOOTH_DEPOSIT, price);
}

/**
 * The package nearest a given price.
 *
 * Needed because the operator's Notion database records a price, not a package: a row
 * typed in by hand says "2999 EGP" and nothing about what it was. With a single package
 * this nearly always returns that one, and it stays a function so a second package does
 * not silently break the Notion import.
 */
export function matchPackageByPrice(price: number): BoothPackageDefinition {
  if (!price) return getBoothPackage(DEFAULT_BOOTH_PACKAGE);

  return BOOTH_PACKAGES.reduce((best, tier) =>
    Math.abs(tier.price - price) < Math.abs(best.price - price) ? tier : best,
  );
}

/* -------------------------------------------------------------------- areas */

export type BoothArea = {
  id: string;
  nameAr: string;
  nameEn: string;
  transportFee: number;
};

/**
 * Where the booth goes.
 *
 * The 1500 on "somewhere else" is **the one figure in this file that is still a guess**.
 * Cairo and Giza are covered at no extra cost. If the business does not travel further,
 * delete the third entry and the form stops offering it.
 */
export const BOOTH_AREAS: BoothArea[] = [
  { id: 'CAIRO', nameAr: 'القاهرة', nameEn: 'Cairo', transportFee: 0 },
  { id: 'GIZA', nameAr: 'الجيزة', nameEn: 'Giza', transportFee: 0 },
  { id: 'OTHER', nameAr: 'مكان تاني', nameEn: 'Somewhere else', transportFee: 1500 },
];

export function getBoothArea(id: string | null | undefined): BoothArea | null {
  return BOOTH_AREAS.find((a) => a.id === id) ?? null;
}

/* -------------------------------------------------------------------- media */

/**
 * The booth enquiry number. Falls back to the main one, which is almost certainly
 * right: one business, one phone.
 */
export const BOOTH_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_BOOTH_NUMBER || WHATSAPP_NUMBER;

/**
 * Real photographs, from real events, uploaded to ImageKit.
 *
 * Every one is a portrait phone shot, which is what the layouts are built around: the
 * hero is 3:4 and the gallery crops to square with ImageKit picking the focus, rather
 * than letterboxing tall pictures into landscape boxes.
 */
export const BOOTH_MEDIA = {
  /** Indoors, marble and low sun. The calmest of the set, which is why it leads. */
  hero: '/booth/hero.jpg',
  /**
   * No clip yet. A hero video has to be silent, a few seconds long and encoded for the
   * web; the source footage is 9 to 27MB of phone MOV, which would be a worse first
   * paint than the photograph it replaced. Left empty, the photograph is used.
   */
  heroVideo: '',
  /** Nine, deliberately varied: garden, palace, night, indoors, and a corporate job. */
  gallery: [
    '/booth/gallery-1.jpg',
    '/booth/gallery-2.jpg',
    '/booth/gallery-3.jpg',
    '/booth/gallery-4.jpg',
    '/booth/gallery-5.jpg',
    '/booth/gallery-6.jpg',
    '/booth/gallery-7.jpg',
    '/booth/gallery-8.jpg',
    '/booth/gallery-9.jpg',
  ],
} as const;

/**
 * The invitations card on the home.
 *
 * Still a placeholder: every photograph supplied is of the booth, and an invitation is
 * a screen rather than a thing that can be photographed at an event. A rendered card
 * would do, and none exists yet.
 */
export const INVITATIONS_MEDIA = {
  hero: 'PLACEHOLDER/invitations/hero.jpg',
} as const;

/** True for any media path nobody has replaced yet. */
export function isPlaceholderMedia(path: string): boolean {
  return path.length === 0 || path.startsWith('PLACEHOLDER');
}

/**
 * The Instagram strip on the home.
 *
 * Four of the booth photographs rather than the posts themselves. Instagram's embed
 * script is third party JavaScript on the first paint of the page most of this
 * business's traffic lands on, and what it renders is four pictures.
 */
export const INSTAGRAM_HANDLE = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || 'qlty.events';

export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;

export const INSTAGRAM_TILES: string[] = [
  '/booth/gallery-1.jpg',
  '/booth/gallery-3.jpg',
  '/booth/gallery-6.jpg',
  '/booth/gallery-9.jpg',
];
