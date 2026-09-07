import type { CSSProperties } from 'react';
import type { Lang } from '@/generated/prisma/enums';

/**
 * A theme is a set of values, not a second copy of the markup.
 *
 * Each theme supplies colours, a font pair per language, and the name of its open
 * animation. The layout is written once per theme and driven by direction and font
 * variables, so the Arabic and English versions of a card share their structure and
 * only differ where they genuinely should.
 */
export type ThemeFontPair = {
  /** Couple's names and other large text. */
  display: string;
  /** Everything else. */
  body: string;
  /**
   * The Bismillah and the Qur'anic verse, when a theme wants its own face for them.
   *
   * Almost nothing should set this. It exists because the verse is the one element on
   * the card whose typography is a question of correctness rather than of style, and
   * leaving it to `body` was quietly wrong: U+FDFD is a single ligature carried by only
   * a handful of Arabic faces, and Cairo, El Messiri and Reem Kufi are not among them.
   * Three of the original four themes were therefore setting the most sacred element on
   * the card in whatever the operating system happened to substitute. See VERSE_FACE.
   */
  verse?: string;
};

/** The kinds of paper the opening burst can throw. */
export type ConfettiShape = 'strip' | 'square' | 'petal' | 'circle';

/**
 * What rains down when the invitation opens.
 *
 * Art directed per theme rather than one generic burst, because confetti in the wrong
 * colours reads as something pasted over the card instead of part of it. Floral throws
 * petals, midnight throws gold on its dark ground, modern throws very little because
 * restraint is its whole character.
 */
export type ConfettiRecipe = {
  colors: string[];
  shapes: ConfettiShape[];
  /** Roughly how many pieces the burst throws in total. */
  count: number;
};

export type ThemeDefinition = {
  id: string;
  nameAr: string;
  nameEn: string;
  /** Pre-selected when this theme is chosen, per the spec's sensible default rule. */
  defaultMusicTrackId: string;
  /** Fills the --inv-* slots declared in globals.css. */
  vars: Record<string, string>;
  fonts: Record<Lang, ThemeFontPair>;
  /**
   * Whether the theme is offered in the picker.
   *
   * Retiring a design cannot mean deleting it. Invitations already sold carry their
   * theme id in the database and have to keep rendering years later, so a retired theme
   * stays registered and simply stops being on sale. This is what lets the set be
   * curated without breaking a link somebody has already sent to three hundred guests.
   */
  listed: boolean;
  /** Colour used for the browser chrome and the Open Graph card background. */
  themeColor: string;
  confetti: ConfettiRecipe;
};

/**
 * The face the Bismillah and the verse are set in, in every theme.
 *
 * Amiri Quran is a Naskh cut specifically for Qur'anic text: it carries U+FDFD, it sets
 * tashkeel without collision, and it is the same in all sixteen themes on purpose. The
 * rest of the card speaks in the theme's own voice; this one block does not, because a
 * verse rendered in a novelty display face is a mistake no palette can excuse.
 */
const VERSE_FACE = 'var(--font-amiri-quran), Georgia, serif';

const classic: ThemeDefinition = {
  id: 'classic',
  listed: false,
  nameAr: 'كلاسيك',
  nameEn: 'Classic',
  defaultMusicTrackId: 'oud-nights',
  themeColor: '#faf5ec',
  vars: {
    '--inv-bg': '#faf5ec',
    '--inv-panel': '#f3e9d8',
    '--inv-ink': '#33302a',
    '--inv-muted': '#7a6f5c',
    '--inv-accent': '#b18b47',
    '--inv-accent-soft': '#d9c08a',
    '--inv-line': 'rgba(177, 139, 71, 0.32)',
  },
  confetti: {
    colors: ['#b18b47', '#d9c08a', '#e9dcc0', '#fdfaf3', '#8a6a32'],
    shapes: ['strip', 'square'],
    count: 130,
  },
  fonts: {
    // Aref Ruqaa is a Ruqaa style calligraphic face, right for the names on a formal
    // card. Amiri is a Naskh revival that sets tashkeel correctly, which matters for
    // the verse.
    AR: {
      display: 'var(--font-aref), Georgia, serif',
      body: 'var(--font-amiri), Georgia, serif',
    },
    // Cormorant Garamond carries the same high stroke contrast as Amiri, so the two
    // languages read as one design rather than two.
    EN: {
      display: 'var(--font-cormorant), Georgia, serif',
      body: 'var(--font-cormorant), Georgia, serif',
    },
  },
};

const modern: ThemeDefinition = {
  id: 'modern',
  listed: false,
  nameAr: 'مودرن',
  nameEn: 'Modern',
  defaultMusicTrackId: 'piano-vows',
  themeColor: '#fcfcfb',
  vars: {
    '--inv-bg': '#fcfcfb',
    '--inv-panel': '#f2f2f0',
    '--inv-ink': '#1c1c1a',
    '--inv-muted': '#8a8a85',
    '--inv-accent': '#9a9a92',
    '--inv-accent-soft': '#cfcfc8',
    '--inv-line': 'rgba(28, 28, 26, 0.14)',
  },
  confetti: {
    colors: ['#1c1c1a', '#9a9a92', '#cfcfc8', '#b18b47'],
    shapes: ['strip'],
    count: 55,
  },
  fonts: {
    // Cairo has an even, upright rhythm that suits generous whitespace, and Jost is
    // its geometric counterpart in Latin. Neither draws attention to itself, which is
    // the whole point of this theme.
    AR: {
      display: 'var(--font-cairo), system-ui, sans-serif',
      body: 'var(--font-cairo), system-ui, sans-serif',
    },
    EN: {
      display: 'var(--font-jost), system-ui, sans-serif',
      body: 'var(--font-jost), system-ui, sans-serif',
    },
  },
};

const floral: ThemeDefinition = {
  id: 'floral',
  listed: false,
  nameAr: 'ورد',
  nameEn: 'Floral',
  defaultMusicTrackId: 'strings-morning',
  themeColor: '#fdf6f4',
  vars: {
    '--inv-bg': '#fdf6f4',
    '--inv-panel': '#f6eae6',
    '--inv-ink': '#40332f',
    '--inv-muted': '#8a7770',
    // Blush against sage, which is the pairing this style is built on.
    '--inv-accent': '#c98b86',
    '--inv-accent-soft': '#9fae94',
    '--inv-line': 'rgba(201, 139, 134, 0.32)',
  },
  confetti: {
    colors: ['#c98b86', '#e7bcb7', '#9fae94', '#f6dfdb', '#fdfaf3'],
    shapes: ['petal', 'circle', 'strip'],
    count: 140,
  },
  fonts: {
    AR: {
      display: 'var(--font-el-messiri), Georgia, serif',
      body: 'var(--font-el-messiri), Georgia, serif',
    },
    EN: {
      display: 'var(--font-playfair), Georgia, serif',
      body: 'var(--font-playfair), Georgia, serif',
    },
  },
};

const midnight: ThemeDefinition = {
  id: 'midnight',
  listed: false,
  nameAr: 'ليلي',
  nameEn: 'Midnight',
  defaultMusicTrackId: 'cinematic-forever',
  themeColor: '#131a2a',
  vars: {
    '--inv-bg': '#131a2a',
    '--inv-panel': '#1b2338',
    '--inv-ink': '#f2ece0',
    '--inv-muted': '#9aa3b8',
    '--inv-accent': '#d4b169',
    '--inv-accent-soft': '#e8d3a0',
    '--inv-line': 'rgba(212, 177, 105, 0.34)',
  },
  confetti: {
    colors: ['#d4b169', '#e8d3a0', '#f2ece0', '#ffffff'],
    shapes: ['strip', 'circle'],
    count: 120,
  },
  fonts: {
    // Reem Kufi is geometric rather than cursive, which is what holds up when it is
    // set large in gold on a dark ground. Cormorant carries the same drama in Latin.
    AR: {
      display: 'var(--font-reem-kufi), Georgia, serif',
      body: 'var(--font-reem-kufi), Georgia, serif',
    },
    EN: {
      display: 'var(--font-cormorant), Georgia, serif',
      body: 'var(--font-cormorant), Georgia, serif',
    },
  },
};


/**
 * مشربية · Mashrabiya
 *
 * The turned-wood window screen of an old Cairo house. The card starts as a screen you cannot see through, and opens by cutting a window in it — after that every part of the invitation sits in its own hole in the lattice, never on a page.
 *
 * Owns one structural axis and no other theme may borrow it: aperture.
 * Content sits in HOLES, not on a ground. No other theme in the set — new or existing — puts its blocks inside voids cut through a full-bleed pattern; classic puts a panel on paper, modern puts a column on air, this puts nothing anywhere and cuts windows instead.
 */
const mashrabiya: ThemeDefinition = {
  id: 'mashrabiya',
  listed: true,
  nameAr: 'مشربية',
  nameEn: 'Mashrabiya',
  defaultMusicTrackId: 'qanun-serenade',
  themeColor: '#f7f1e4',
  vars: {
    '--inv-bg': '#f7f1e4',
    '--inv-panel': '#ebe1cc',
    '--inv-ink': '#241c14',
    '--inv-muted': '#64492b',
    '--inv-accent': '#6f3d16',
    '--inv-accent-soft': '#c8a06a',
    '--inv-line': 'rgba(111, 61, 22, 0.30)',
  },
  confetti: {
    colors: ['#6f3d16', '#c8a06a', '#ebe1cc', '#4a2f14', '#f7f1e4'],
    shapes: ['strip', 'square'],
    count: 110,
  },
  fonts: {
    AR: {
      display: 'var(--font-kufam), system-ui, sans-serif',
      body: 'var(--font-almarai), system-ui, sans-serif',
    },
    EN: {
      display: 'var(--font-marcellus), Georgia, serif',
      body: 'var(--font-spectral), Georgia, serif',
    },
  },
};

/**
 * الإيوان · Iwan
 *
 * The whole page stands inside one great Cairene arch — you read the invitation from within the hall, and the walls narrow around you as you walk in.
 *
 * Owns one structural axis and no other theme may borrow it: frame-as-measure.
 * The frame IS the layout. No other theme lets an ornament define the reading measure, and none other has a measure that changes as you scroll. مشربية cuts holes in a screen; this draws a wall on both sides of you and moves it inward.
 */
const iwan: ThemeDefinition = {
  id: 'iwan',
  listed: true,
  nameAr: 'الإيوان',
  nameEn: 'Iwan',
  defaultMusicTrackId: 'cinematic-forever',
  themeColor: '#f3ece1',
  vars: {
    '--inv-bg': '#f3ece1',
    '--inv-panel': '#e9dfcd',
    '--inv-ink': '#2a231c',
    '--inv-muted': '#5f5341',
    '--inv-accent': '#7b3f2e',
    '--inv-accent-soft': '#c69a86',
    '--inv-line': 'rgba(123, 63, 46, 0.24)',
  },
  confetti: {
    colors: ['#7b3f2e', '#c69a86', '#f3ece1', '#e9dfcd', '#2a231c'],
    shapes: ['square', 'strip'],
    count: 130,
  },
  fonts: {
    AR: {
      display: 'var(--font-changa), system-ui, sans-serif',
      body: 'var(--font-fustat), system-ui, sans-serif',
    },
    EN: {
      display: 'var(--font-forum), Georgia, serif',
      body: 'var(--font-alegreya-sans), system-ui, sans-serif',
    },
  },
};

/**
 * قنديل · Qandeel
 *
 * Everything on the card hangs from the top of the page on its own thread, at its own depth, like the lanterns strung over the hall.
 *
 * Owns one structural axis and no other theme may borrow it: suspension and z-depth.
 * REPLACES MIDNIGHT. Same promise — dark ground, gold, evening — kept properly. Midnight's one structural idea, a gold spine, sits at left-1/2 behind a fully centred column and is therefore invisible; here the structure is the first thing you see, because things visibly hang, at three depths, on lines of unequal length. Shipping both would sell the same promise twice and one of them badly. The picker rendering must show the hung plumb lines, not the palette, or customers will read this as a recolour and the replacement argument collapses.
 */
const qandeel: ThemeDefinition = {
  id: 'qandeel',
  listed: true,
  nameAr: 'قنديل',
  nameEn: 'Qandeel',
  defaultMusicTrackId: 'oud-nights',
  themeColor: '#0f1e22',
  vars: {
    '--inv-bg': '#0f1e22',
    '--inv-panel': '#16292d',
    '--inv-ink': '#f0e8dc',
    '--inv-muted': '#b9ada0',
    '--inv-accent': '#e3b566',
    '--inv-accent-soft': '#6f8f8c',
    '--inv-line': 'rgba(227, 181, 102, 0.20)',
  },
  confetti: {
    colors: ['#e3b566', '#f0e8dc', '#6f8f8c', '#c99a4e', '#f5d9a4'],
    shapes: ['circle', 'square'],
    count: 130,
  },
  fonts: {
    AR: {
      display: 'var(--font-markazi), Georgia, serif',
      body: 'var(--font-almarai), system-ui, sans-serif',
    },
    EN: {
      display: 'var(--font-prata), Georgia, serif',
      body: 'var(--font-manrope), system-ui, sans-serif',
    },
  },
};

/**
 * مخمل · Makhmal
 *
 * The invitation is a velvet curtain: it parts to reveal the card, and the whole page stays pleated fabric with your names lying across it.
 *
 * Owns one structural axis and no other theme may borrow it: continuous surface.
 * ONE CONTINUOUS MATERIAL, no container anywhere. Every other theme in the set puts content on, in, under or beside something; this puts it directly on the surface and folds the surface where a divider would go. There is not one rectangle, rule or box in the theme.
 */
const makhmal: ThemeDefinition = {
  id: 'makhmal',
  listed: true,
  nameAr: 'مخمل',
  nameEn: 'Makhmal',
  defaultMusicTrackId: 'joyful-zaffa',
  themeColor: '#2a1220',
  vars: {
    '--inv-bg': '#2a1220',
    '--inv-panel': '#3a1a2c',
    '--inv-ink': '#f6e9ec',
    '--inv-muted': '#d3b3bd',
    '--inv-accent': '#e0b66c',
    '--inv-accent-soft': '#7a3b52',
    '--inv-line': 'rgba(224, 182, 108, 0.24)',
  },
  confetti: {
    colors: ['#7a3b52', '#a8536e', '#e0b66c', '#f6e9ec', '#5c2439'],
    shapes: ['petal', 'strip'],
    count: 150,
  },
  fonts: {
    AR: {
      display: 'var(--font-zain), system-ui, sans-serif',
      body: 'var(--font-noto-naskh), Georgia, serif',
    },
    EN: {
      display: 'var(--font-bodoni-moda), Georgia, serif',
      body: 'var(--font-lora), Georgia, serif',
    },
  },
};

/**
 * خيامية · Khayamiya
 *
 * The tentmaker's appliqué — the cut cloth every Egyptian wedding street is actually hung with, stitched into a card.
 *
 * Owns one structural axis and no other theme may borrow it: field stack.
 * The only fully saturated ground in a sixteen-theme set. At picker size this is a deep red card among fifteen light and dark ones and it cannot be confused with anything.
 */
const khayamiya: ThemeDefinition = {
  id: 'khayamiya',
  listed: true,
  nameAr: 'خيامية',
  nameEn: 'Khayamiya',
  defaultMusicTrackId: 'baladi-wedding',
  themeColor: '#7c1f2b',
  vars: {
    '--inv-bg': '#7c1f2b',
    '--inv-panel': '#8f2733',
    '--inv-ink': '#f9ecd6',
    '--inv-muted': '#e8cdab',
    '--inv-accent': '#f5c542',
    '--inv-accent-soft': '#3f9b86',
    '--inv-line': 'rgba(249, 236, 214, 0.34)',
  },
  confetti: {
    colors: ['#f5c542', '#3f9b86', '#f9ecd6', '#7c1f2b', '#5c1420'],
    shapes: ['square', 'petal'],
    count: 120,
  },
  fonts: {
    AR: {
      display: 'var(--font-rakkas), system-ui, sans-serif',
      body: 'var(--font-tajawal), system-ui, sans-serif',
    },
    EN: {
      display: 'var(--font-fraunces), Georgia, serif',
      body: 'var(--font-karla), system-ui, sans-serif',
    },
  },
};

/**
 * غروب · Ghouroub
 *
 * The card is a sunset. It starts pale at the top, deepens as you scroll, and the horizon moves across the page as the sun goes down.
 *
 * Owns one structural axis and no other theme may borrow it: horizon.
 * The organising mark is a LINE THAT MOVES, not a container. خيامية also stacks full-bleed fields, but its boundaries are hard sewn seams and its density is maximal; here the boundaries are invisible 60px blends, the ornament budget is the sparsest of the twelve, and the only persistent object is a 1px rule that sits at a different height in every band.
 */
const ghouroub: ThemeDefinition = {
  id: 'ghouroub',
  listed: true,
  nameAr: 'غروب',
  nameEn: 'Ghouroub',
  defaultMusicTrackId: 'strings-morning',
  themeColor: '#fdf3ea',
  vars: {
    '--inv-bg': '#fdf3ea',
    '--inv-panel': '#f8e2d3',
    '--inv-ink': '#3a221c',
    '--inv-muted': '#754a3a',
    '--inv-accent': '#93381f',
    '--inv-accent-soft': '#ef9f6a',
    '--inv-line': 'rgba(147, 56, 31, 0.26)',
  },
  confetti: {
    colors: ['#ef9f6a', '#f8e2d3', '#fdf3ea', '#93381f', '#e8c9a0'],
    shapes: ['circle', 'strip'],
    count: 95,
  },
  fonts: {
    AR: {
      display: 'var(--font-alexandria), system-ui, sans-serif',
      body: 'var(--font-plex-arabic), system-ui, sans-serif',
    },
    EN: {
      display: 'var(--font-tenor-sans), system-ui, sans-serif',
      body: 'var(--font-inter-tight), system-ui, sans-serif',
    },
  },
};

/**
 * النتيجة · Netiga
 *
 * The wall calendar every Egyptian home has — torn to the one day that matters.
 *
 * Owns one structural axis and no other theme may borrow it: dated leaves.
 * The only theme whose cover shows the guest something TRUE and current — today's real date — and then changes it. Every other opening reveals a hidden thing; this one replaces a real one.
 */
const netiga: ThemeDefinition = {
  id: 'netiga',
  listed: true,
  nameAr: 'النتيجة',
  nameEn: 'Netiga',
  defaultMusicTrackId: 'baladi-wedding',
  themeColor: '#e8e0cd',
  vars: {
    '--inv-bg': '#e8e0cd',
    '--inv-panel': '#fcfaf5',
    '--inv-ink': '#1f1d1a',
    '--inv-muted': '#575143',
    '--inv-accent': '#98202a',
    '--inv-accent-soft': '#e0a09f',
    '--inv-line': 'rgba(31, 29, 26, 0.20)',
  },
  confetti: {
    colors: ['#98202a', '#e0a09f', '#fcfaf5', '#e8e0cd', '#1f1d1a'],
    shapes: ['square', 'strip'],
    count: 125,
  },
  fonts: {
    AR: {
      display: 'var(--font-lalezar), system-ui, sans-serif',
      body: 'var(--font-readex-pro), system-ui, sans-serif',
    },
    EN: {
      display: 'var(--font-archivo), system-ui, sans-serif',
      body: 'var(--font-archivo), system-ui, sans-serif',
    },
  },
};

/**
 * السجل · Sijill
 *
 * The marriage entered in the register — ruled, witnessed, and quiet.
 *
 * Owns one structural axis and no other theme may borrow it: ruled table.
 * The only tabular layout in the set. Not a column, not a spine, not a field stack — a ruled table with a fixed label column and a value column, at a strict 44px pitch, unbroken from header to footer.
 */
const sijill: ThemeDefinition = {
  id: 'sijill',
  listed: true,
  nameAr: 'السجل',
  nameEn: 'Sijill',
  defaultMusicTrackId: 'qanun-serenade',
  themeColor: '#f5f2ea',
  vars: {
    '--inv-bg': '#f5f2ea',
    '--inv-panel': '#ece7da',
    '--inv-ink': '#1d1b16',
    '--inv-muted': '#55503f',
    '--inv-accent': '#2c4a6e',
    '--inv-accent-soft': '#8aa3bd',
    '--inv-line': 'rgba(29, 27, 22, 0.26)',
  },
  confetti: {
    colors: [],
    shapes: ['square', 'strip'],
    count: 0,
  },
  fonts: {
    AR: {
      display: 'var(--font-scheherazade), Georgia, serif',
      body: 'var(--font-scheherazade), Georgia, serif',
    },
    EN: {
      display: 'var(--font-newsreader), Georgia, serif',
      body: 'var(--font-newsreader), Georgia, serif',
    },
  },
};

/**
 * الظرف · Zarf
 *
 * A sealed letter that unfolds in your hand — and the card still carries the creases it was folded along.
 *
 * Owns one structural axis and no other theme may borrow it: fold grid.
 * The only layout in the set built on a FOLD. Everything else flows, stacks, hangs or tabulates; this one is divided by two creases placed at content boundaries, and no block is allowed to straddle one.
 */
const zarf: ThemeDefinition = {
  id: 'zarf',
  listed: true,
  nameAr: 'الظرف',
  nameEn: 'Zarf',
  defaultMusicTrackId: 'oud-nights',
  themeColor: '#f4efe4',
  vars: {
    '--inv-bg': '#f4efe4',
    '--inv-panel': '#ebe3d3',
    '--inv-ink': '#2e2b24',
    '--inv-muted': '#5f5747',
    '--inv-accent': '#8a3b2f',
    '--inv-accent-soft': '#c98a72',
    '--inv-line': 'rgba(46, 43, 36, 0.18)',
  },
  confetti: {
    colors: ['#8a3b2f', '#c98a72', '#f4efe4', '#ebe3d3', '#5f5747'],
    shapes: ['square', 'strip'],
    count: 90,
  },
  fonts: {
    AR: {
      display: 'var(--font-ruwudu), Georgia, serif',
      body: 'var(--font-noto-naskh), Georgia, serif',
    },
    EN: {
      display: 'var(--font-eb-garamond), Georgia, serif',
      body: 'var(--font-eb-garamond), Georgia, serif',
    },
  },
};

/**
 * حديقة · Hadiqa
 *
 * A single jasmine vine climbs the whole length of your invitation, and every part of the card grows off it.
 *
 * Owns one structural axis and no other theme may borrow it: off-centre column with a live ornament gutter.
 * REPLACES FLORAL. The brief retires blush-and-sage outright and says painterly floral is structurally out of reach without an illustrator, with line work as the honest substitute. This is that substitute with a real structure attached: floral's sprigs sit in the corners of a rounded panel and vanish for 95% of the scroll; here the ornament runs the entire document height and indexes every section, so the theme keeps the promise its name makes. Shipping both would sell one botanical card twice, one of them not keeping its word.
 */
const hadiqa: ThemeDefinition = {
  id: 'hadiqa',
  listed: true,
  nameAr: 'حديقة',
  nameEn: 'Hadiqa',
  defaultMusicTrackId: 'strings-morning',
  themeColor: '#f4f2e9',
  vars: {
    '--inv-bg': '#f4f2e9',
    '--inv-panel': '#eceadd',
    '--inv-ink': '#222c26',
    '--inv-muted': '#4e5c53',
    '--inv-accent': '#356044',
    '--inv-accent-soft': '#a9bda0',
    '--inv-line': 'rgba(53, 96, 68, 0.28)',
  },
  confetti: {
    colors: ['#f4f2e9', '#ffffff', '#a9bda0', '#356044', '#d9cf8c'],
    shapes: ['petal', 'circle'],
    count: 110,
  },
  fonts: {
    AR: {
      display: 'var(--font-mirza), Georgia, serif',
      body: 'var(--font-estedad), system-ui, sans-serif',
    },
    EN: {
      display: 'var(--font-gilda-display), Georgia, serif',
      body: 'var(--font-alice), Georgia, serif',
    },
  },
};

/**
 * الرزمة · Rizma
 *
 * The bundle of insert cards that comes inside a good invitation, dealt out one at a time.
 *
 * Owns one structural axis and no other theme may borrow it: discrete objects.
 * FIVE OBJECTS AT FIVE DIFFERENT MEASURES. Every other theme in the set, new and existing, has one measure for the whole card (or one that changes continuously, as in الإيوان). This has five discrete widths because there are five discrete pieces of paper, and that is the structural claim.
 */
const rizma: ThemeDefinition = {
  id: 'rizma',
  listed: true,
  nameAr: 'الرزمة',
  nameEn: 'Rizma',
  defaultMusicTrackId: 'modern-romance',
  themeColor: '#e9e4dc',
  vars: {
    '--inv-bg': '#e9e4dc',
    '--inv-panel': '#fbf9f5',
    '--inv-ink': '#26241f',
    '--inv-muted': '#5c584f',
    '--inv-accent': '#3f4a30',
    '--inv-accent-soft': '#9aa88a',
    '--inv-line': 'rgba(38, 36, 31, 0.18)',
  },
  confetti: {
    colors: ['#3f4a30', '#9aa88a', '#fbf9f5', '#e9e4dc', '#26241f'],
    shapes: ['square', 'strip'],
    count: 110,
  },
  fonts: {
    AR: {
      display: 'var(--font-el-messiri), system-ui, sans-serif',
      body: 'var(--font-vazirmatn), system-ui, sans-serif',
    },
    EN: {
      display: 'var(--font-sorts-mill-goudy), Georgia, serif',
      body: 'var(--font-work-sans), system-ui, sans-serif',
    },
  },
};

/**
 * اللوح · Lawh
 *
 * One slab of stone, one continuous inscription — nothing on the card but the words, cut in.
 *
 * Owns one structural axis and no other theme may borrow it: monolith.
 * ZERO SECTION BREAKS. No dividers, no panels, no rules, no ornament between blocks — the only theme in the set (and the only one against the existing four) where hierarchy is carried entirely by size and vertical interval. Classic separates with a border and a seal; modern separates with hairlines eight times while claiming to separate with space; this separates with nothing.
 */
const lawh: ThemeDefinition = {
  id: 'lawh',
  listed: true,
  nameAr: 'اللوح',
  nameEn: 'Lawh',
  defaultMusicTrackId: 'piano-vows',
  themeColor: '#f0ebdf',
  vars: {
    '--inv-bg': '#f0ebdf',
    '--inv-panel': '#e6dfcd',
    '--inv-ink': '#1e1c17',
    '--inv-muted': '#56503f',
    '--inv-accent': '#5f4e29',
    '--inv-accent-soft': '#b3a180',
    '--inv-line': 'rgba(30, 28, 23, 0.25)',
  },
  confetti: {
    colors: ['#5f4e29', '#b3a180', '#f0ebdf', '#e6dfcd', '#1e1c17'],
    shapes: ['square'],
    count: 60,
  },
  fonts: {
    AR: {
      display: 'var(--font-noto-kufi), system-ui, sans-serif',
      body: 'var(--font-markazi), Georgia, serif',
    },
    EN: {
      display: 'var(--font-cinzel), Georgia, serif',
      body: 'var(--font-crimson-pro), Georgia, serif',
    },
  },
};

/**
 * Every theme the product can render, in picker order.
 *
 * The twelve come first and the original four sit at the end marked `listed: false`.
 * They are still here, and still render, because invitations sold under them are still
 * being opened; they are simply no longer offered. Adding a theme means an entry above,
 * a Cover and a Card in src/themes/<id>, and a line in src/themes/components.ts.
 * Nothing else changes.
 */
export const THEMES: ThemeDefinition[] = [
  mashrabiya,
  iwan,
  qandeel,
  makhmal,
  khayamiya,
  ghouroub,
  netiga,
  sijill,
  zarf,
  hadiqa,
  rizma,
  lawh,
  // Retired, kept renderable.
  classic,
  modern,
  floral,
  midnight,
];

/** What the picker offers. See the `listed` note on ThemeDefinition. */
export const LISTED_THEMES: ThemeDefinition[] = THEMES.filter((theme) => theme.listed);

const THEMES_BY_ID = new Map(THEMES.map((theme) => [theme.id, theme]));

/**
 * حديقة. The engagement is the commonest first purchase and this is the set's strongest
 * card for it, so it is what a customer sees before they have chosen anything.
 */
export const DEFAULT_THEME = hadiqa;

export function getTheme(id: string | null | undefined): ThemeDefinition {
  if (id) {
    const found = THEMES_BY_ID.get(id);
    if (found) return found;
  }
  return DEFAULT_THEME;
}

export function isValidThemeId(id: string): boolean {
  return THEMES_BY_ID.has(id);
}

export function themeName(theme: ThemeDefinition, lang: Lang): string {
  return lang === 'AR' ? theme.nameAr : theme.nameEn;
}

/**
 * The inline style that carries a theme onto its wrapper element. Colours and the
 * font pair for the language being rendered land as custom properties, which is what
 * the utility classes in globals.css read.
 */
export function themeStyle(theme: ThemeDefinition, lang: Lang): CSSProperties {
  return {
    ...theme.vars,
    '--inv-display': theme.fonts[lang].display,
    '--inv-body': theme.fonts[lang].body,
    // Only the Arabic card has a verse. On an English card this slot is never read, and
    // pointing it at the body face keeps it from resolving to nothing if it ever is.
    '--inv-verse': lang === 'AR' ? (theme.fonts.AR.verse ?? VERSE_FACE) : theme.fonts[lang].body,
  } as CSSProperties;
}
