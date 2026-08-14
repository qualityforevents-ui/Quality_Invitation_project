import {
  Amiri,
  Aref_Ruqaa,
  Cairo,
  Cormorant_Garamond,
  El_Messiri,
  Inter,
  Jost,
  Playfair_Display,
  Reem_Kufi,
  Tajawal,
} from 'next/font/google';

/**
 * Arabic subsetting note.
 *
 * The spec asks for fonts subset to only the characters actually used. That is not
 * reachable for this product: the largest text on the card is the couple's names,
 * which are user input and unknown at build time. What is possible is loading only
 * the Arabic and Latin ranges instead of the whole face, which is what the subsets
 * option below does, and letting the browser skip the Latin file entirely on an
 * Arabic card. Everything is declared with display swap so text paints immediately
 * on a slow mobile connection rather than sitting invisible.
 */

/** Builder and landing UI, Arabic. A clean sans, not a display face. */
export const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700'],
  variable: '--font-tajawal',
  display: 'swap',
});

/** Builder and landing UI, Latin. */
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

/** Classic theme display face. Calligraphic, used for the couple's names only. */
export const arefRuqaa = Aref_Ruqaa({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-aref',
  display: 'swap',
});

/** Classic theme body face. A Naskh revival that sets tashkeel properly. */
export const amiri = Amiri({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-amiri',
  display: 'swap',
});

/** Latin counterpart for the classic theme, paired to sit beside Amiri. */
export const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

/*
 * Theme faces, one pair per theme.
 *
 * All of these are declared with preload false. Every theme's fonts end up in the same
 * stylesheet, because the registry imports them all, and preloading would have a guest
 * opening a classic invitation download the faces for three themes they will never see.
 * With preloading off the browser fetches only the faces that rendered text actually
 * uses, which is one pair.
 */

/** Modern minimal, Arabic. A clean contemporary sans with a large x height. */
export const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '600'],
  variable: '--font-cairo',
  display: 'swap',
  preload: false,
});

/** Modern minimal, Latin. Geometric, restrained, pairs with Cairo's even rhythm. */
export const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jost',
  display: 'swap',
  preload: false,
});

/** Floral soft, Arabic. Rounded and warm without tipping into a script face. */
export const elMessiri = El_Messiri({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600'],
  variable: '--font-el-messiri',
  display: 'swap',
  preload: false,
});

/** Floral soft, Latin. High contrast and slightly romantic. */
export const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
  preload: false,
});

/** Dark elegant, Arabic. Geometric Kufi, which holds up at large sizes in gold. */
export const reemKufi = Reem_Kufi({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600'],
  variable: '--font-reem-kufi',
  display: 'swap',
  preload: false,
});

/** Applied to the builder and landing surfaces. */
export const uiFontVariables = `${tajawal.variable} ${inter.variable}`;

/**
 * Applied wherever an invitation renders, including the preview and the theme picker.
 *
 * Every theme's variables are declared together so a single wrapper serves all four and
 * switching theme is a change of values rather than of markup. Only the faces the
 * chosen theme names in its font pair are ever downloaded.
 */
export const invitationFontVariables = [
  arefRuqaa.variable,
  amiri.variable,
  cormorant.variable,
  cairo.variable,
  jost.variable,
  elMessiri.variable,
  playfair.variable,
  reemKufi.variable,
].join(' ');
