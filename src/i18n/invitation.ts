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
  /** Surah Ar-Rum 21. Arabic card only. */
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
    countdownHeading: string;
    started: string;
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
    countdownHeading: 'باقي على الفرح',
    started: 'الفرح النهاردة',
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
    countdownHeading: 'Counting down',
    started: 'Today is the day',
    muteAudio: 'Mute the music',
    unmuteAudio: 'Play the music',
  },
};

const COPY: Record<Lang, InvitationCopy> = { AR, EN };

export function getInvitationCopy(lang: Lang): InvitationCopy {
  return COPY[lang] ?? AR;
}
