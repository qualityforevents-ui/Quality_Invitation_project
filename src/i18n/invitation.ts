import { getVerse, verseSource } from '@/lib/verses';
import type { EventType, Lang } from '@/generated/prisma/enums';

/**
 * The words that appear inside the invitation itself.
 *
 * This is kept apart from src/i18n/ui.ts for two reasons. The register is different:
 * the builder speaks Egyptian, the invitation is formal. And the two languages are
 * written separately rather than translated.
 *
 * The Arabic card opens with the Bismillah and the verse from Surah Ar-Rum, carries a
 * line of classical verse, and uses the يتشرفان بدعوتكم register. Rendering any of
 * that literally in English reads like a machine did it, so the English card is built
 * from its own material: an opening line about the families, "request the pleasure of
 * your company", and a short line of its own. Neither is a translation of the other
 * and neither should become one.
 */

type EventCopy = Record<EventType, string>;

export type InvitationCopy = {
  /** The Bismillah glyph. Arabic card only, null on the English one. */
  bismillah: string | null;
  /**
   * The verse the customer chose, or null when they chose to have none.
   *
   * Null is also what the English card carries, and every theme guards the block on
   * `bismillah && verse`, so "no verse" reuses a layout each design already draws
   * rather than a state none of them has been seen in. The Bismillah goes with it:
   * the block is one object in all twelve layouts, not two stacked ones.
   */
  verse: string | null;
  verseSource: string | null;
  /** A line of classical verse in Arabic, a short line of its own in English. */
  poetry: string;
  /** The formal line that names the occasion. */
  inviteLine: EventCopy;
  /** Used on the cover and in the Open Graph title. */
  eventName: EventCopy;
  /**
   * Opens the English card, above the names. Standard English invitation phrasing,
   * naming nobody: the Arabic card opens with the Bismillah instead and has no use
   * for it.
   */
  familiesPrefix: string | null;
  /**
   * What sits between the two names. Arabic invitations join them with و; an ampersand
   * is a Latin mark and reads as a foreign object on an otherwise Arabic card.
   */
  nameSeparator: string;
  roleGroom: string;
  roleBride: string;
  openButton: string;
  labels: {
    date: string;
    time: string;
    venue: string;
    mapsButton: string;
    countdownDays: string;
    countdownHours: string;
    countdownMinutes: string;
    countdownSeconds: string;
    /**
     * Both of these name the occasion, so both are keyed by it.
     *
     * They were flat strings, which meant every card counted down to الفرح and
     * announced الفرح النهاردة — including the engagements and the عقد قران, which
     * are most of what this product sells. The two other occasion-dependent strings
     * on the card, inviteLine and eventName, were records from the start; these two
     * were the ones that got missed, and a plain string is what let them be missed.
     */
    countdownHeading: EventCopy;
    started: EventCopy;
    muteAudio: string;
    unmuteAudio: string;
  };
};

const AR: InvitationCopy = {
  bismillah: '﷽',
  verse:
    'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
  verseSource: 'سورة الروم، الآية 21',
  poetry: 'وَمَا الحُبُّ إِلاَّ سَبَبٌ لِلتَّلاقِي، وَقَدْ جَمَعَتْنَا المَقَادِيرُ حُبّاً',
  inviteLine: {
    ENGAGEMENT: 'يتشرفان بدعوتكم لحضور حفل الخطوبة',
    WEDDING: 'يتشرفان بدعوتكم لحضور حفل الزفاف',
    KATB_KETAB: 'يتشرفان بدعوتكم لحضور حفل عقد القران',
  },
  eventName: {
    ENGAGEMENT: 'حفل خطوبة',
    WEDDING: 'حفل زفاف',
    KATB_KETAB: 'عقد قران',
  },
  familiesPrefix: null,
  nameSeparator: 'و',
  roleGroom: 'العريس',
  roleBride: 'العروس',
  openButton: 'افتح الدعوة',
  labels: {
    date: 'التاريخ',
    time: 'الساعة',
    venue: 'المكان',
    mapsButton: 'موقع القاعة على الخريطة',
    countdownDays: 'يوم',
    countdownHours: 'ساعة',
    countdownMinutes: 'دقيقة',
    countdownSeconds: 'ثانية',
    countdownHeading: {
      ENGAGEMENT: 'باقي على الخطوبة',
      WEDDING: 'باقي على الفرح',
      KATB_KETAB: 'باقي على عقد القران',
    },
    started: {
      ENGAGEMENT: 'الخطوبة النهاردة',
      WEDDING: 'الفرح النهاردة',
      KATB_KETAB: 'عقد القران النهاردة',
    },
    muteAudio: 'اكتم الموسيقى',
    unmuteAudio: 'شغل الموسيقى',
  },
};

const EN: InvitationCopy = {
  bismillah: null,
  verse: null,
  verseSource: null,
  poetry: 'Where two stories become one',
  inviteLine: {
    ENGAGEMENT: 'request the pleasure of your company at their engagement celebration',
    WEDDING: 'request the pleasure of your company at their wedding celebration',
    KATB_KETAB: 'request the pleasure of your company at their marriage ceremony',
  },
  eventName: {
    ENGAGEMENT: 'Engagement',
    WEDDING: 'Wedding',
    KATB_KETAB: 'Katb Ketab',
  },
  familiesPrefix: 'Together with their families',
  nameSeparator: '&',
  roleGroom: 'The Groom',
  roleBride: 'The Bride',
  openButton: 'Open invitation',
  labels: {
    date: 'Date',
    time: 'Time',
    venue: 'Venue',
    mapsButton: 'Open the venue in Maps',
    countdownDays: 'Days',
    countdownHours: 'Hours',
    countdownMinutes: 'Minutes',
    countdownSeconds: 'Seconds',
    countdownHeading: {
      ENGAGEMENT: 'Counting down to the engagement',
      WEDDING: 'Counting down to the wedding',
      KATB_KETAB: 'Counting down to the Katb Ketab',
    },
    started: {
      ENGAGEMENT: 'The engagement is today',
      WEDDING: 'The wedding is today',
      KATB_KETAB: 'The Katb Ketab is today',
    },
    muteAudio: 'Mute the music',
    unmuteAudio: 'Play the music',
  },
};

const COPY: Record<Lang, InvitationCopy> = { AR, EN };

/**
 * The words on the card, for a language and a chosen verse.
 *
 * `verseId` is optional because two callers legitimately have no use for it: the
 * builder's thumbnail and the Open Graph image draw no verse at all. Everywhere the
 * verse can actually appear, the id comes off the invitation — `InvitationView` carries
 * it for exactly that reason.
 */
export function getInvitationCopy(lang: Lang, verseId?: string | null): InvitationCopy {
  const base = COPY[lang] ?? AR;

  // The English card has no verse in any variation of it, so there is nothing to swap.
  if (base.verse === null) return base;

  const verse = getVerse(verseId);

  return {
    ...base,
    verse: verse?.text ?? null,
    verseSource: verse ? verseSource(verse, lang) : null,
  };
}
