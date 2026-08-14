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
  /** Colour used for the browser chrome and the Open Graph card background. */
  themeColor: string;
  confetti: ConfettiRecipe;
};

const classic: ThemeDefinition = {
  id: 'classic',
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
 * The four themes. Adding one means an entry here plus a Cover and a Card in
 * src/themes/<id>, registered in src/themes/components.ts. Nothing else changes.
 */
export const THEMES: ThemeDefinition[] = [classic, modern, floral, midnight];

const THEMES_BY_ID = new Map(THEMES.map((theme) => [theme.id, theme]));

export const DEFAULT_THEME = classic;

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
  } as CSSProperties;
}
