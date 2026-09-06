import {
  Alegreya_Sans,
  Alexandria,
  Alice,
  Almarai,
  Amiri,
  Amiri_Quran,
  Archivo,
  Aref_Ruqaa,
  Bodoni_Moda,
  Cairo,
  Cinzel,
  Cormorant_Garamond,
  Crimson_Pro,
  EB_Garamond,
  El_Messiri,
  Estedad,
  Forum,
  Fraunces,
  Fustat,
  Gilda_Display,
  IBM_Plex_Sans_Arabic,
  Inter,
  Inter_Tight,
  Jost,
  Karla,
  Kufam,
  Lalezar,
  Lora,
  Manrope,
  Marcellus,
  Markazi_Text,
  Mirza,
  Newsreader,
  Noto_Kufi_Arabic,
  Noto_Naskh_Arabic,
  Playfair_Display,
  Prata,
  Qahiri,
  Rakkas,
  Readex_Pro,
  Reem_Kufi,
  Reem_Kufi_Ink,
  Ruwudu,
  Scheherazade_New,
  Sorts_Mill_Goudy,
  Spectral,
  Tajawal,
  Tenor_Sans,
  Vazirmatn,
  Work_Sans,
  Zain,
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

/*
 * The classic theme's three faces.
 *
 * These carried `preload: true` while the invitation only ever rendered on its own
 * route. The builder is one page now and the theme miniatures render on the site's
 * only entry page, so preloading here would push three invitation faces at every
 * visitor who lands on the home page, including the majority who never tap Start.
 * The reasoning under the theme faces below now applies to every face in this file:
 * with preloading off the browser fetches only the pair the rendered card actually
 * uses, and that is one pair.
 */

/** Classic theme display face. Calligraphic, used for the couple's names only. */
export const arefRuqaa = Aref_Ruqaa({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-aref',
  display: 'swap',
  preload: false,
});

/** Classic theme body face. A Naskh revival that sets tashkeel properly. */
export const amiri = Amiri({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-amiri',
  display: 'swap',
  preload: false,
});

/** Latin counterpart for the classic theme, paired to sit beside Amiri. */
export const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
  preload: false,
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


/* -------------------------------------------------------------------------- */
/*  The twelve themes added in the design rebuild.                            */
/*                                                                            */
/*  Every face here is declared with preload false, for the reason given above */
/*  the older theme faces: the registry imports all of them, so preloading any */
/*  one would have a guest opening a single invitation download the faces for  */
/*  fifteen others. With preloading off the browser fetches only what rendered */
/*  text actually uses, which is one pair plus the verse face.                 */
/* -------------------------------------------------------------------------- */

/** مشربية display. A wide engineered Kufi whose stem rhythm matches the bobbins of a turned-wood screen. */
export const kufam = Kufam({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-kufam',
  display: 'swap',
  preload: false,
});

/** مشربية and قنديل body. The flattest neutral Arabic on the list, which is the point: it stays out of the way. */
export const almarai = Almarai({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-almarai',
  display: 'swap',
  preload: false,
});

/** الإيوان display. A single-weight Kufi cut from the Cairo street-sign tradition. */
export const qahiri = Qahiri({
  subsets: ['arabic', 'latin'],
  weight: ['400'],
  variable: '--font-qahiri',
  display: 'swap',
  preload: false,
});

/** الإيوان body. */
export const fustat = Fustat({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600'],
  variable: '--font-fustat',
  display: 'swap',
  preload: false,
});

/** قنديل display. The inked cut of Reem Kufi: wet-brush terminals that hold at large sizes in gold. */
export const reemKufiInk = Reem_Kufi_Ink({
  subsets: ['arabic', 'latin'],
  weight: ['400'],
  variable: '--font-reem-kufi-ink',
  display: 'swap',
  preload: false,
});

/** مخمل display. High-contrast and theatrical, which is what velvet asks for. */
export const zain = Zain({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-zain',
  display: 'swap',
  preload: false,
});

/** مخمل and الظرف body. The plain workhorse Naskh, used where the surface is already doing the work. */
export const notoNaskh = Noto_Naskh_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-noto-naskh',
  display: 'swap',
  preload: false,
});

/** خيامية display. A flat poster face, which is exactly what appliqué lettering is. */
export const rakkas = Rakkas({
  subsets: ['arabic', 'latin'],
  weight: ['400'],
  variable: '--font-rakkas',
  display: 'swap',
  preload: false,
});

/** غروب display. Contemporary, open, and it holds up against a sky. */
export const alexandria = Alexandria({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '700'],
  variable: '--font-alexandria',
  display: 'swap',
  preload: false,
});

/** غروب body. */
export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600'],
  variable: '--font-plex-arabic',
  display: 'swap',
  preload: false,
});

/** النتيجة display. The condensed poster Arabic of a printed wall calendar. */
export const lalezar = Lalezar({
  subsets: ['arabic', 'latin'],
  weight: ['400'],
  variable: '--font-lalezar',
  display: 'swap',
  preload: false,
});

/** النتيجة body. */
export const readexPro = Readex_Pro({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '600'],
  variable: '--font-readex-pro',
  display: 'swap',
  preload: false,
});

/** السجل, set in one voice. A manuscript Naskh, right for a register. */
export const scheherazade = Scheherazade_New({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-scheherazade',
  display: 'swap',
  preload: false,
});

/** الظرف display. A letter-writing hand rather than a display face. */
export const ruwudu = Ruwudu({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600'],
  variable: '--font-ruwudu',
  display: 'swap',
  preload: false,
});

/** حديقة display. Calligraphic without tipping into a script face. */
export const mirza = Mirza({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600'],
  variable: '--font-mirza',
  display: 'swap',
  preload: false,
});

/** حديقة body. */
export const estedad = Estedad({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600'],
  variable: '--font-estedad',
  display: 'swap',
  preload: false,
});

/** الرزمة body. */
export const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600'],
  variable: '--font-vazirmatn',
  display: 'swap',
  preload: false,
});

/** اللوح display. Geometric Kufi reads as cut stone, which is the whole theme. */
export const notoKufi = Noto_Kufi_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-noto-kufi',
  display: 'swap',
  preload: false,
});

/** اللوح body. */
export const markaziText = Markazi_Text({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600'],
  variable: '--font-markazi',
  display: 'swap',
  preload: false,
});

/** THE VERSE FACE, used by every theme and by nothing else. See the note above the invitationFontVariables export. */
export const amiriQuran = Amiri_Quran({
  subsets: ['arabic', 'latin'],
  weight: ['400'],
  variable: '--font-amiri-quran',
  display: 'swap',
  preload: false,
});

/** مشربية Latin display. Inscriptional Roman, flat-topped, the same authority as Kufam. */
export const marcellus = Marcellus({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-marcellus',
  display: 'swap',
  preload: false,
});

/** مشربية Latin body. */
export const spectral = Spectral({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-spectral',
  display: 'swap',
  preload: false,
});

/** الإيوان Latin display. */
export const forum = Forum({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-forum',
  display: 'swap',
  preload: false,
});

/** الإيوان Latin body. */
export const alegreyaSans = Alegreya_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  variable: '--font-alegreya-sans',
  display: 'swap',
  preload: false,
});

/** قنديل Latin display. Didone contrast, which is what catches the light. */
export const prata = Prata({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-prata',
  display: 'swap',
  preload: false,
});

/** قنديل Latin body. */
export const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-manrope',
  display: 'swap',
  preload: false,
});

/** مخمل Latin display. */
export const bodoniModa = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  variable: '--font-bodoni-moda',
  display: 'swap',
  preload: false,
});

/** مخمل Latin body. */
export const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap',
  preload: false,
});

/** خيامية Latin display. Soft-serif with a wobble, the closest Latin gets to cut cloth. */
export const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
  preload: false,
});

/** خيامية Latin body. */
export const karla = Karla({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-karla',
  display: 'swap',
  preload: false,
});

/** غروب Latin display. */
export const tenorSans = Tenor_Sans({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-tenor-sans',
  display: 'swap',
  preload: false,
});

/** غروب Latin body. */
export const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-inter-tight',
  display: 'swap',
  preload: false,
});

/** النتيجة, set in one voice. Grotesque, the way calendar numerals are printed. */
export const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-archivo',
  display: 'swap',
  preload: false,
});

/** السجل, set in one voice. A text face with a record-keeping temperament. */
export const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
  preload: false,
});

/** الظرف, set in one voice. The letter-press Garamond a written invitation is set in. */
export const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-eb-garamond',
  display: 'swap',
  preload: false,
});

/** حديقة Latin display. */
export const gildaDisplay = Gilda_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-gilda-display',
  display: 'swap',
  preload: false,
});

/** حديقة Latin body. */
export const alice = Alice({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-alice',
  display: 'swap',
  preload: false,
});

/** الرزمة Latin display. The face good letterpress stationery is actually set in. */
export const sortsMillGoudy = Sorts_Mill_Goudy({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-sorts-mill-goudy',
  display: 'swap',
  preload: false,
});

/** الرزمة Latin body. */
export const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-work-sans',
  display: 'swap',
  preload: false,
});

/** اللوح Latin display. Roman capitals cut in stone, which is the theme's entire premise. */
export const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-cinzel',
  display: 'swap',
  preload: false,
});

/** اللوح Latin body. */
export const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-crimson-pro',
  display: 'swap',
  preload: false,
});

/** Applied to the builder and landing surfaces. */
export const uiFontVariables = `${tajawal.variable} ${inter.variable}`;

/**
 * Applied wherever an invitation renders, including the preview and the theme picker.
 *
 * Every theme's variables are declared together so a single wrapper serves all sixteen
 * and switching theme is a change of values rather than of markup. Only the faces the
 * chosen theme names in its font pair are ever downloaded.
 *
 * Amiri Quran is in every theme rather than in one, because it is not a style choice.
 * The Bismillah is U+FDFD, a single ligature that only a handful of Arabic faces carry,
 * and Cairo, El Messiri and Reem Kufi are not among them: three of the original four
 * themes were rendering the most sacred element on the card in whatever the operating
 * system happened to substitute, at a size that swung by nearly a factor of two between
 * an iPhone and an Android. Every theme now names its own verse face and they all name
 * this one, so the verse and the Bismillah are set correctly and identically everywhere
 * while the rest of the card stays in the theme's own voice.
 */
export const invitationFontVariables = [
  // The verse face, shared by every theme.
  amiriQuran.variable,

  // The original four.
  arefRuqaa.variable,
  amiri.variable,
  cormorant.variable,
  cairo.variable,
  jost.variable,
  elMessiri.variable,
  playfair.variable,
  reemKufi.variable,

  // Arabic faces for the twelve.
  kufam.variable,
  almarai.variable,
  qahiri.variable,
  fustat.variable,
  reemKufiInk.variable,
  zain.variable,
  notoNaskh.variable,
  rakkas.variable,
  alexandria.variable,
  plexArabic.variable,
  lalezar.variable,
  readexPro.variable,
  scheherazade.variable,
  ruwudu.variable,
  mirza.variable,
  estedad.variable,
  vazirmatn.variable,
  notoKufi.variable,
  markaziText.variable,
  tajawal.variable,

  // Latin faces for the twelve.
  marcellus.variable,
  spectral.variable,
  forum.variable,
  alegreyaSans.variable,
  prata.variable,
  manrope.variable,
  bodoniModa.variable,
  lora.variable,
  fraunces.variable,
  karla.variable,
  tenorSans.variable,
  interTight.variable,
  archivo.variable,
  newsreader.variable,
  ebGaramond.variable,
  gildaDisplay.variable,
  alice.variable,
  sortsMillGoudy.variable,
  workSans.variable,
  cinzel.variable,
  crimsonPro.variable,
].join(' ');
