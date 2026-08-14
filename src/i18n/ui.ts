import type { Lang } from '@/generated/prisma/enums';

/**
 * Every piece of customer facing copy lives here, never inline in a component.
 *
 * The Arabic is Egyptian and warm, the way a person would actually speak. It is
 * deliberately not formal MSA. The one place formal register is correct is inside
 * the invitation itself, and that copy lives in src/i18n/invitation.ts instead.
 *
 * The English is written on its own terms rather than translated from the Arabic.
 */
const AR = {
  common: {
    next: 'التالي',
    back: 'رجوع',
    saving: 'بيتحفظ',
    saved: 'اتحفظ',
    optional: 'اختياري',
    copy: 'نسخ',
    copied: 'اتنسخ',
    loading: 'ثانية واحدة',
    egp: 'جنيه',
    langName: 'العربية',
    switchTo: 'English',
  },

  landing: {
    title: 'دعوة فرحك، بشكل يليق بيها',
    subtitle:
      'اعمل دعوة إلكترونية لخطوبتك أو فرحك في دقايق، وابعتها لضيوفك على واتساب برابط واحد.',
    cta: 'ابدأ دعوتك',
    sample: 'شوف نموذج دعوة',
    priceLabel: 'السعر',
    priceNote: 'دفعة واحدة، من غير اشتراك',
    howTitle: 'بتشتغل إزاي',
    step1Title: 'املا بيانات الفرح',
    step1Body: 'الأسماء، التاريخ، المكان. دقيقتين وخلصت.',
    step2Title: 'اختار الشكل والموسيقى',
    step2Body: 'تصاميم جاهزة، وتشوف دعوتك بتتغير قدامك على طول.',
    step3Title: 'شوف دعوتك وابعتها',
    step3Body: 'تعاين الدعوة كاملة قبل ما تدفع، وبعدها تاخد رابط تبعته لضيوفك.',
    support: 'محتاج مساعدة؟ كلمنا على واتساب',
    supportMessage: 'السلام عليكم، عندي سؤال عن الدعوات الإلكترونية',
  },

  build: {
    heading: 'بيانات الفرح',
    sub: 'كل حاجة بتتحفظ لوحدها وانت بتكتب.',
    eventType: 'المناسبة',
    eventTypeEngagement: 'خطوبة',
    eventTypeWedding: 'فرح',
    eventTypeKatbKetab: 'كتب كتاب',
    name1: 'اسم العريس',
    name1Placeholder: 'معاذ',
    name2: 'اسم العروسة',
    name2Placeholder: 'ريم',
    namesHint: 'اكتب الأسماء بالعربي أو بالإنجليزي، زي ما تحب.',
    eventDate: 'تاريخ الفرح',
    eventTime: 'الساعة',
    venueName: 'مكان الفرح',
    venuePlaceholder: 'قاعة جنينة',
    venueMapUrl: 'لينك المكان على جوجل مابس',
    venueMapHint: 'افتح المكان على جوجل مابس واعمل مشاركة، وحط اللينك هنا.',
    customMessage: 'رسالة خاصة لضيوفك',
    customMessagePlaceholder: 'وجودكم يسعدنا',
    charactersLeft: 'حرف متبقي',
    toTheme: 'كمل للتصميم',
  },

  theme: {
    heading: 'الشكل والموسيقى',
    invitationLang: 'لغة الدعوة',
    invitationLangHint: 'دي لغة الدعوة اللي ضيوفك هيشوفوها، مش لغة الموقع.',
    themeGrid: 'التصميم',
    music: 'الموسيقى',
    musicHint: 'الموسيقى بتشتغل أول ما الضيف يفتح الدعوة.',
    musicMissing: 'الملف لسه مترفعش',
    play: 'شغل',
    pause: 'وقف',
    photo: 'صورة العروسين',
    photoSoon: 'رفع الصور هيتفعل قريب.',
    photoGuidance: 'صورة واضحة للعروسين، الوجوه ظاهرة، إضاءة جيدة، تجنب الاسكرين شوت',
    photoChoose: 'اختار صورة',
    photoChange: 'غيّر الصورة',
    photoRemove: 'شيل الصورة',
    photoPreparing: 'بنجهز الصورة',
    photoUploading: 'بنرفع الصورة',
    photoDragHint: 'حرّك الصورة جوه الإطار لحد ما تعجبك.',
    photoNotConfigured: 'رفع الصور لسه مش مفعّل على السيرفر.',
    toPreview: 'شوف دعوتك',
  },

  preview: {
    backToEdit: 'رجوع للتعديل',
    getLink: 'هات رابط دعوتي',
    hint: 'دي دعوتك بالظبط زي ما الضيف هيشوفها.',
  },

  payment: {
    heading: 'خطوة أخيرة',
    sub: 'حوّل المبلغ على إنستاباي، وابعتلنا صورة التحويل على واتساب.',
    amountLabel: 'المبلغ',
    instapayTitle: 'حوّل على إنستاباي',
    instapayAddress: 'عنوان إنستاباي',
    instapayName: 'اسم المستلم',
    requestIdLabel: 'رقم الطلب',
    requestIdHint: 'الرقم ده بيربط تحويلك بدعوتك. ابعته معاك في الرسالة.',
    phoneLabel: 'رقم واتساب عشان نبعتلك رابط دعوتك',
    phonePlaceholder: '01xxxxxxxxx',
    phoneError: 'اكتب رقم موبايل مصري صحيح',
    whatsappCta: 'ابعت صورة التحويل على واتساب',
    attachReminder: 'مهم: ارفق صورة التحويل مع الرسالة.',
    desktopTitle: 'انت على الكمبيوتر',
    desktopNote:
      'واتساب من الكمبيوتر ممكن يطلب منك مسح كود. الأسهل انك تنسخ الرسالة دي وتبعتها من موبايلك.',
    copyMessage: 'انسخ الرسالة',
    openAnyway: 'افتح واتساب ويب برضه',
  },

  status: {
    heading: 'استلمنا طلبك',
    body: 'بنراجع التحويل وبعدها نفعّل الرابط. هنبعتلك رسالة على واتساب أول ما يتفعّل.',
    expectation: 'المراجعة بتتم بشكل يدوي، فممكن تاخد وقت حسب معاد إرسالك.',
    requestIdLabel: 'رقم الطلب',
    linkLabel: 'رابط دعوتك',
    notActive: 'لسه مش مفعّل',
    active: 'مفعّل',
    rejected: 'في مشكلة في الطلب',
    trouble: 'في مشكلة؟ كلمنا على واتساب',
    troubleMessage: 'السلام عليكم، عندي استفسار عن طلب رقم ',
    checking: 'بنتابع حالة الطلب',
  },

  success: {
    heading: 'دعوتك جاهزة',
    shareTitle: 'رابط الدعوة للمشاركة',
    shareHint: 'ابعت الرابط ده لضيوفك.',
    shareCta: 'ابعت على واتساب',
    shareMessage: 'مدعوين تشرفونا',
    editTitle: 'رابط التعديل، احتفظ بيه لنفسك',
    editWarn: 'متبعتش الرابط ده لحد. اللي معاه يقدر يعدّل في الدعوة.',
  },

  errors: {
    required: 'الحقل ده مطلوب',
    missingFields: 'ناقص',
    mapUrl: 'لازم يكون لينك من جوجل مابس',
    messageTooLong: 'الرسالة أطول من اللازم',
    dateInPast: 'التاريخ ده عدى خلاص',
    generic: 'حصلت مشكلة. جرب تاني.',
    saveFailed: 'مقدرناش نحفظ التعديل. اتأكد من النت.',
    saveFailedShort: 'متحفظش',
    photoType: 'الملف ده مش صورة. ابعت JPG أو PNG أو صورة من الآيفون.',
    photoTooLarge: 'الصورة أكبر من 10 ميجا. جرب صورة تانية.',
    photoTooSmall: 'الصورة صغيرة أوي. محتاجين صورة 1000 في 1000 على الأقل.',
    photoHeic: 'مقدرناش نفتح صورة الآيفون دي. جرب تبعتها كـ JPG.',
    photoDecode: 'مقدرناش نقرا الصورة دي. جرب صورة تانية.',
    photoUpload: 'الرفع فشل. اتأكد من النت وجرب تاني.',
  },

  notAvailable: {
    title: 'الدعوة دي مش متاحة',
    body: 'الرابط ممكن يكون اتغير، أو الدعوة لسه مش مفعّلة.',
    cta: 'اعمل دعوتك انت كمان',
  },

  invitationFooter: 'صنع بواسطة qlty.events',
};

/**
 * Derived from the Arabic dictionary, which makes Arabic the source of truth: adding a
 * key there and forgetting it in English is a type error rather than a blank space on
 * the page. Deliberately not `as const`, so the two dictionaries have to share their
 * keys without being asked to share their words.
 */
export type Dictionary = typeof AR;

const EN: Dictionary = {
  common: {
    next: 'Next',
    back: 'Back',
    saving: 'Saving',
    saved: 'Saved',
    optional: 'Optional',
    copy: 'Copy',
    copied: 'Copied',
    loading: 'One moment',
    egp: 'EGP',
    langName: 'English',
    switchTo: 'العربية',
  },

  landing: {
    title: 'An invitation worth sharing',
    subtitle:
      'Build a digital invitation for your engagement or wedding in minutes, then send it to your guests on WhatsApp as a single link.',
    cta: 'Build your invitation',
    sample: 'See a sample invitation',
    priceLabel: 'Price',
    priceNote: 'One payment, no subscription',
    howTitle: 'How it works',
    step1Title: 'Fill in the details',
    step1Body: 'Names, date, venue. It takes two minutes.',
    step2Title: 'Choose a design and music',
    step2Body: 'Pick a style and watch your invitation change as you go.',
    step3Title: 'Preview, then send',
    step3Body: 'See the whole invitation before you pay, then get a link for your guests.',
    support: 'Need help? Message us on WhatsApp',
    supportMessage: 'Hello, I have a question about the digital invitations',
  },

  build: {
    heading: 'Event details',
    sub: 'Everything saves by itself as you type.',
    eventType: 'Occasion',
    eventTypeEngagement: 'Engagement',
    eventTypeWedding: 'Wedding',
    eventTypeKatbKetab: 'Katb Ketab',
    name1: "Groom's name",
    name1Placeholder: 'Moaaz',
    name2: "Bride's name",
    name2Placeholder: 'Reem',
    namesHint: 'Type the names in Arabic or English, whichever you prefer.',
    eventDate: 'Date',
    eventTime: 'Time',
    venueName: 'Venue',
    venuePlaceholder: 'Janeena Hall',
    venueMapUrl: 'Google Maps link',
    venueMapHint: 'Open the venue in Google Maps, tap share, and paste the link here.',
    customMessage: 'A message for your guests',
    customMessagePlaceholder: 'Your presence would mean the world to us',
    charactersLeft: 'characters left',
    toTheme: 'Continue to design',
  },

  theme: {
    heading: 'Design and music',
    invitationLang: 'Invitation language',
    invitationLangHint: 'This is the language your guests will see, not the language of this site.',
    themeGrid: 'Design',
    music: 'Music',
    musicHint: 'The music starts when a guest opens the invitation.',
    musicMissing: 'File not uploaded yet',
    play: 'Play',
    pause: 'Pause',
    photo: 'Photo of the couple',
    photoSoon: 'Photo upload is coming soon.',
    photoGuidance:
      'A clear photo of the couple, faces visible, good light. Avoid screenshots.',
    photoChoose: 'Choose a photo',
    photoChange: 'Change photo',
    photoRemove: 'Remove photo',
    photoPreparing: 'Preparing your photo',
    photoUploading: 'Uploading',
    photoDragHint: 'Drag the photo inside the frame until it looks right.',
    photoNotConfigured: 'Photo upload is not switched on yet.',
    toPreview: 'Preview your invitation',
  },

  preview: {
    backToEdit: 'Back to edit',
    getLink: 'Get my link',
    hint: 'This is your invitation exactly as a guest will see it.',
  },

  payment: {
    heading: 'One last step',
    sub: 'Send the amount over InstaPay, then send us the transfer screenshot on WhatsApp.',
    amountLabel: 'Amount',
    instapayTitle: 'Pay with InstaPay',
    instapayAddress: 'InstaPay address',
    instapayName: 'Recipient name',
    requestIdLabel: 'Request ID',
    requestIdHint: 'This is what links your transfer to your invitation. Send it with your message.',
    phoneLabel: 'WhatsApp number so we can send you your invitation link',
    phonePlaceholder: '01xxxxxxxxx',
    phoneError: 'Enter a valid Egyptian mobile number',
    whatsappCta: 'Send the screenshot on WhatsApp',
    attachReminder: 'Important: attach the transfer screenshot to your message.',
    desktopTitle: 'You are on a computer',
    desktopNote:
      'WhatsApp on a computer may ask you to scan a code. It is easier to copy this message and send it from your phone.',
    copyMessage: 'Copy the message',
    openAnyway: 'Open WhatsApp Web anyway',
  },

  status: {
    heading: 'We have your request',
    body: 'We are checking the transfer and will activate your link. You will get a WhatsApp message the moment it goes live.',
    expectation: 'Every request is reviewed by a person, so the wait depends on when you sent it.',
    requestIdLabel: 'Request ID',
    linkLabel: 'Your invitation link',
    notActive: 'Not live yet',
    active: 'Live',
    rejected: 'There is a problem with this request',
    trouble: 'Something wrong? Message us on WhatsApp',
    troubleMessage: 'Hello, I have a question about request ',
    checking: 'Checking your request',
  },

  success: {
    heading: 'Your invitation is ready',
    shareTitle: 'Invitation link, for sharing',
    shareHint: 'Send this link to your guests.',
    shareCta: 'Share on WhatsApp',
    shareMessage: 'We would love for you to join us',
    editTitle: 'Edit link, keep this one to yourself',
    editWarn: 'Do not share this link. Anyone who has it can change your invitation.',
  },

  errors: {
    required: 'This field is required',
    missingFields: 'Still needed',
    mapUrl: 'This needs to be a Google Maps link',
    messageTooLong: 'That message is too long',
    dateInPast: 'That date has already passed',
    generic: 'Something went wrong. Please try again.',
    saveFailed: 'We could not save that change. Check your connection.',
    saveFailedShort: 'Not saved',
    photoType: 'That file is not an image. Send a JPG, a PNG, or a photo from your iPhone.',
    photoTooLarge: 'That photo is over 10 MB. Try a different one.',
    photoTooSmall: 'That photo is too small. We need at least 1000 by 1000 pixels.',
    photoHeic: 'We could not open that iPhone photo. Try sending it as a JPG.',
    photoDecode: 'We could not read that photo. Try a different one.',
    photoUpload: 'The upload failed. Check your connection and try again.',
  },

  notAvailable: {
    title: 'This invitation is not available',
    body: 'The link may have changed, or the invitation is not live yet.',
    cta: 'Build your own invitation',
  },

  invitationFooter: 'Made with qlty.events',
};

const DICTIONARIES: Record<Lang, Dictionary> = { AR, EN };

export function getDictionary(lang: Lang): Dictionary {
  return DICTIONARIES[lang] ?? AR;
}

export function dirFor(lang: Lang): 'rtl' | 'ltr' {
  return lang === 'AR' ? 'rtl' : 'ltr';
}

export function htmlLangFor(lang: Lang): string {
  return lang === 'AR' ? 'ar' : 'en';
}
