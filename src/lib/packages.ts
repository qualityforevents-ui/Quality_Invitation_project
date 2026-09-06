import type { Package } from '@/generated/prisma/enums';

/**
 * What the three tiers cost and what they include.
 *
 * Prices live here rather than in the database, so changing one is an edit and a deploy
 * rather than a migration. Invitations already sold keep the tier they were bought on,
 * and the price recorded against a paid invitation is whatever this file said at the
 * time, which is why the admin reads the price through packagePrice rather than
 * assuming every sale was the current figure.
 */
export type PackageDefinition = {
  id: Package;
  price: number;
  /** Never expires. */
  permanent: boolean;
  /** Collects a written design brief from the couple. */
  customDesign: boolean;
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  taglineEn: string;
  featuresAr: string[];
  featuresEn: string[];
};

export const PACKAGES: PackageDefinition[] = [
  {
    id: 'BASIC',
    price: 300,
    permanent: false,
    customDesign: false,
    nameAr: 'الأساسية',
    nameEn: 'Basic',
    taglineAr: 'كل اللي محتاجه لفرحك',
    taglineEn: 'Everything you need for the day',
    featuresAr: [
      'كل التصاميم الاتناشر',
      'مكتبة الموسيقى كاملة',
      'صورة العروسين',
      'عربي أو إنجليزي',
      'الرابط شغال لحد شهر بعد الفرح',
    ],
    featuresEn: [
      'All twelve designs',
      'The full music library',
      'A photo of the couple',
      'Arabic or English',
      'Link stays live until a month after the event',
    ],
  },
  {
    id: 'UNLIMITED',
    price: 500,
    permanent: true,
    customDesign: false,
    nameAr: 'الدائمة',
    nameEn: 'Forever',
    taglineAr: 'ذكرى تفضل معاكم',
    taglineEn: 'A keepsake, not just an invitation',
    featuresAr: [
      'كل مميزات الباقة الأساسية',
      'الرابط بيفضل شغال للأبد',
      'تقدروا تعدلوا في أي وقت',
      'تبعتوه لأي حد بعد الفرح بسنين',
    ],
    featuresEn: [
      'Everything in Basic',
      'The link never expires',
      'Edit it whenever you like',
      'Still there to share years later',
    ],
  },
  {
    id: 'CUSTOM',
    price: 1000,
    permanent: true,
    customDesign: true,
    nameAr: 'تصميم خاص',
    nameEn: 'Bespoke',
    taglineAr: 'دعوة مصممة ليكم انتم',
    taglineEn: 'Designed around you',
    featuresAr: [
      'كل مميزات الباقة الدائمة',
      'تصميم مخصوص حسب طلبكم',
      'اختيار الألوان والخطوط معاكم',
      'مراجعة وتعديل لحد ما يعجبكم',
    ],
    featuresEn: [
      'Everything in Forever',
      'A design made to your brief',
      'Colours and typography chosen with you',
      'Revised until you are happy with it',
    ],
  },
];

const BY_ID = new Map(PACKAGES.map((p) => [p.id, p]));

export const DEFAULT_PACKAGE: Package = 'BASIC';

export function getPackage(id: Package | string | null | undefined): PackageDefinition {
  if (id) {
    const found = BY_ID.get(id as Package);
    if (found) return found;
  }
  return BY_ID.get(DEFAULT_PACKAGE) ?? PACKAGES[0];
}

export function isValidPackage(id: string): id is Package {
  return BY_ID.has(id as Package);
}

export function packagePrice(id: Package | string | null | undefined): number {
  return getPackage(id).price;
}

export function packageName(id: Package | string | null | undefined, lang: 'AR' | 'EN'): string {
  const definition = getPackage(id);
  return lang === 'AR' ? definition.nameAr : definition.nameEn;
}
