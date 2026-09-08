import type { Lang } from './types';

/**
 * The lines a couple can put on their card, offered rather than demanded.
 *
 * Every card used to carry one fixed line of classical verse, the same on all of them,
 * and separately offered a free-text message that sat near the footer. So an invitation
 * could end up with two pieces of writing that had nothing to do with each other, and
 * the one the couple actually chose was the quieter of the two.
 *
 * They are one question now. A sample is just a string, and a message somebody writes
 * themselves is the same string typed instead of picked, which is why nothing here has
 * an id and nothing is stored but the text. A card sold with a sample keeps its words
 * even if this list is rewritten tomorrow.
 *
 * Offered in the language the card is being built in, because a Latin line under an
 * Arabic Bismillah is not a style choice anybody made on purpose.
 */
export const SAMPLE_QUOTES: Record<Lang, string[]> = {
  AR: [
    // The line every card carried before this question existed. First, so a customer
    // who liked it and never thought about it can still have it in one tap.
    'وَمَا الحُبُّ إِلاَّ سَبَبٌ لِلتَّلاقِي، وَقَدْ جَمَعَتْنَا المَقَادِيرُ حُبّاً',
    'وجودكم معانا هو أجمل هدية',
    'في يوم من أجمل أيام عمرنا، نتمنى نشوفكم جنبنا',
    'الفرح مايكملش غير بوجود اللي بنحبهم',
  ],
  EN: [
    'Where two stories become one',
    'Your presence with us is the finest gift of all',
    'On the happiest day of our lives, we would love you beside us',
    'A celebration is not complete without the people we love',
  ],
};

export function sampleQuotes(lang: Lang): string[] {
  return SAMPLE_QUOTES[lang] ?? SAMPLE_QUOTES.AR;
}
