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
    step: 'خطوة',
    of: 'من',
    stepData: 'البيانات',
    stepDesign: 'التصميم',
    stepPreview: 'المعاينة',
    stepPayment: 'الدفع',
  },

  landing: {
    title: 'دعوة فرحك، بشكل يليق بيها',
    subtitle:
      'اعمل دعوة إلكترونية لخطوبتك أو فرحك في دقايق، وابعتها لضيوفك على واتساب برابط واحد.',
    cta: 'ابدأ دعوتك',
    sample: 'شوف نموذج دعوة',
    sampleNote: 'دي دعوة نموذجية عشان تشوف الشكل والحركة.',
    sampleCta: 'اعمل دعوتك انت كمان',
    sampleBack: 'رجوع للموقع',
    priceLabel: 'السعر',
    priceNote: 'دفعة واحدة، من غير اشتراك',
    howTitle: 'بتشتغل إزاي',
    step1Title: 'املا بيانات الفرح',
    step1Body: 'الأسماء، التاريخ، المكان. دقيقتين وخلصت.',
    step2Title: 'اختار الشكل والموسيقى',
    step2Body: 'تصاميم جاهزة، وتشوف دعوتك بتتغير قدامك على طول.',
    step3Title: 'شوف دعوتك وابعتها',
    step3Body: 'تعاين الدعوة كاملة قبل ما تدفع، وبعدها تاخد رابط تبعته لضيوفك.',
    packagesTitle: 'اختار باقتك',
    packagesSub: 'كل الباقات فيها نفس التصاميم والموسيقى. الفرق في مدة الرابط والتصميم الخاص.',
    packagesCta: 'ابدأ بالباقة دي',
    packagesPopular: 'الأكثر طلباً',
    flowTitle: 'الرحلة من الأول للآخر',
    flowSub: 'من غير حساب ولا تسجيل. كل حاجة بتتحفظ لوحدها.',
    /*
     * Lived inline in the component until the rebuild, which is how it came to describe
     * a four screen journey that no longer exists. Here it is covered by the type that
     * makes a missing English key a compile error.
     */
    howSteps: [
      {
        title: 'جاوب سؤال سؤال',
        body: 'اسم العريس، اسم العروسة، التاريخ، المكان. سؤال واحد في المرة، وكل إجابة بتتحفظ لوحدها. من غير حساب ولا باسورد، وتقدر تقفل الصفحة وترجع تكمل من نفس الموبايل.',
      },
      {
        title: 'اختار الشكل والموسيقى',
        body: 'اتناشر تصميم، وبتشوف اسمك انت وشريكتك جوه كل واحد قبل ما تختار. تسمع الموسيقى قبل ما تحطها، وترفع صورة وتحركها جوه الإطار زي ما يعجبك.',
      },
      {
        title: 'شوف الدعوة كاملة',
        body: 'الدعوة بتفتح قدامك بالظبط زي ما الضيف هيشوفها، بالحركة والموسيقى. ده قبل ما تدفع، مش بعده.',
      },
      {
        title: 'حوّل وابعتلنا',
        body: 'تحوّل على إنستاباي، وتضغط زرار واحد يفتحلك واتساب برسالة فيها رقم طلبك جاهزة. ترفق صورة التحويل وتبعت.',
      },
      {
        title: 'نفعّل الرابط',
        body: 'بنراجع التحويل بنفسنا وبنفعّل الدعوة. الصفحة اللي انت عليها بتتحول لوحدها أول ما تتفعّل، وبيوصلك رابطين: واحد تبعته لضيوفك، وواحد للتعديل تحتفظ بيه لنفسك.',
      },
    ],
    reviewsTitle: 'آراء العرسان',
    reviewsEmpty: 'لسه مفيش آراء منشورة. كن أول واحد يكتب رأيه بعد فرحك.',
    reviewsCta: 'اكتب رأيك',
    support: 'محتاج مساعدة؟ كلمنا على واتساب',
    supportMessage: 'السلام عليكم، عندي سؤال عن الدعوات الإلكترونية',
  },

  /**
   * The one page flow.
   *
   * Written as questions rather than as field labels, because the flow asks one thing at
   * a time and a bare noun over a lone input reads as a form that has been chopped up.
   * "اسم العريس إيه؟" is somebody asking; "اسم العريس" is a spreadsheet column.
   *
   * The `Summary` keys are the short label each answered question collapses to, and
   * those stay nouns: a stack of ten questions with their question marks still attached
   * is unreadable, and by then the customer is scanning for the thing they want to fix.
   */
  flow: {
    start: 'يلا نبدأ',
    resume: 'كمل دعوتك',
    resumeHint: 'لقينا دعوة بدأتها قبل كده، كمّل من مكانك.',
    next: 'كمل',
    skip: 'عدّيها',
    edit: 'تعديل',
    change: 'غيّر',
    progressLabel: 'اللي خلصته',

    packageTitle: 'اختار باقتك',
    packageSummary: 'الباقة',

    name1Title: 'اسم العريس إيه؟',
    name1Hint: 'هيظهر في الدعوة بالظبط زي ما هتكتبه.',
    name1Summary: 'العريس',
    name2Title: 'وعروستك اسمها إيه؟',
    name2Hint: 'تقدر تعدّل أي اسم بعدين من فوق.',
    name2Summary: 'العروسة',

    occasionTitle: 'المناسبة إيه؟',
    occasionSummary: 'المناسبة',

    dateTitle: 'الفرح إمتى؟',
    dateSummary: 'التاريخ',

    timeTitle: 'الساعة كام؟',
    timeSummary: 'الساعة',
    timeOther: 'ميعاد تاني',

    venueTitle: 'الفرح فين؟',
    venueSummary: 'المكان',

    mapTitle: 'تحب تحط لينك المكان؟',
    mapPlaceholder: 'مثال: https://maps.app.goo.gl/...',
    mapSkip: 'مش معايا لينك',
    mapSummary: 'لينك المكان',
    mapNone: 'من غير لينك',

    messageTitle: 'تحب تكتب كلمة لضيوفك؟',
    messageSkip: 'من غير كلمة',
    messageSummary: 'كلمتك',
    messageNone: 'من غير كلمة',

    langTitle: 'الدعوة تطلع بأي لغة؟',
    langSummary: 'لغة الدعوة',

    themeTitle: 'اختار شكل دعوتك',
    themeSummary: 'التصميم',

    musicTitle: 'اختار الموسيقى',
    musicSummary: 'الموسيقى',

    photoTitle: 'تحب تحطوا صورتكم؟',
    photoSkip: 'من غير صورة',
    photoSummary: 'الصورة',
    photoAdded: 'الصورة اتحطت',
    photoNone: 'من غير صورة',

    previewTitle: 'دعوتك خلصت',
    previewBody: 'افتحها وشوفها بالظبط زي ما ضيوفك هيشوفوها، بالحركة والموسيقى.',
    previewOpen: 'افتح دعوتك',
    previewClose: 'اقفل المعاينة',
    previewNext: 'عجبتني، كمل',
    previewSummary: 'المعاينة',
    previewSeen: 'شوفتها',

    briefTitle: 'احكيلنا التصميم اللي في بالك',
    briefSummary: 'التصميم الخاص',

    phoneTitle: 'رقم الواتساب بتاعك',
    phoneHint: 'عشان نبعتلك رابط دعوتك أول ما يتفعّل.',
    phoneSummary: 'رقم الواتساب',

    payTitle: 'فاضل الدفع بس',
  },

  build: {
    heading: 'بيانات الفرح',
    sub: 'كل حاجة بتتحفظ لوحدها وانت بتكتب.',
    eventType: 'المناسبة',
    eventTypeEngagement: 'خطوبة',
    eventTypeWedding: 'فرح',
    eventTypeKatbKetab: 'كتب كتاب',
    name1: 'اسم العريس',
    name1Placeholder: 'مثال: معاذ',
    name2: 'اسم العروسة',
    name2Placeholder: 'مثال: ريم',
    namesHint: 'اكتب الأسماء زي ما تحب، وهتظهر في الدعوة بالظبط زي ما كتبتها.',
    eventDate: 'تاريخ الفرح',
    eventTime: 'الساعة',
    venueName: 'مكان الفرح',
    venuePlaceholder: 'مثال: قاعة جنينة',
    venueMapUrl: 'لينك المكان على جوجل مابس',
    venueMapHint: 'افتح المكان على جوجل مابس واعمل مشاركة، وحط اللينك هنا.',
    customMessage: 'رسالة خاصة لضيوفك',
    customMessagePlaceholder: 'مثال: وجودكم يسعدنا',
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
    photoUpload: 'ارفع الصورة',
    themeView: 'شوف التصميم',
    convertOffer: 'الدعوة بالعربي والأسماء مكتوبة بالإنجليزي. تحب نكتبهم بالعربي؟ ولو الإملاء مش مظبوط تقدر تعدله بعدين.',
    convertOfferLatin: 'الدعوة بالإنجليزي والأسماء مكتوبة بالعربي. تحب نكتبهم بالإنجليزي؟ وتقدر تعدل الإملاء بعدين.',
    scriptMismatchCta: 'أو عدّل الأسماء بنفسك',
    themePreviewNote: 'دي معاينة للتصميم ده. ارجع عشان تختاره أو تجرب غيره.',
    themePreviewBack: 'رجوع للتصاميم',
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
    packageLabel: 'الباقة',
    customRequestLabel: 'اكتبلنا التصميم اللي في بالك',
    customRequestHint:
      'الألوان، الاستايل، أي حاجة شوفتها وعجبتك. كل ما تكتب أكتر كل ما التصميم يطلع أقرب لتخيلك.',
    methodsLabel: 'ادفع من هنا، الزرار هيفتحلك التطبيق وينسخلك العنوان',
    payInstapay: 'ادفع بإنستاباي',
    payVodafone: 'ادفع بفودافون كاش',
    addressCopied: 'العنوان اتنسخ. الصقه في التطبيق وحوّل المبلغ.',
    afterPayLabel: 'بعد ما تحوّل، اضغط هنا وحد من الفريق هيكلمك على طول',
    instapayTitle: 'حوّل على إنستاباي',
    instapayAddress: 'عنوان إنستاباي',
    instapayName: 'اسم المستلم',
    requestIdLabel: 'رقم الطلب',
    requestIdHint: 'الرقم ده بيربط تحويلك بدعوتك. ابعته معاك في الرسالة.',
    phoneLabel: 'رقم واتساب عشان نبعتلك رابط دعوتك',
    phonePlaceholder: 'مثال: 01012345678',
    phoneError: 'اكتب رقم موبايل مصري صحيح',
    whatsappCta: 'كلمنا على واتساب دلوقتي',
    attachReminder: 'ابعتله صورة التحويل، وهو هيبعتلك رابط دعوتك مفعّل وجاهز تبعته لضيوفك.',
    afterTitle: 'وبعد ما تبعت؟',
    afterBody:
      'المحادثة بتفتح والرسالة متكتوبة فيها كل تفاصيل طلبك، فمش محتاج تكتب حاجة. بنراجع التحويل بإيدينا وبنفعّل الرابط ونبعتهولك في نفس المحادثة.',
    desktopTitle: 'انت على الكمبيوتر',
    desktopNote: 'انت على الكمبيوتر. افتح الصفحة دي من موبايلك عشان أزرار الدفع والواتساب تشتغل.',
    copyMessage: 'انسخ الرسالة',
    notSaved:
      'مقدرناش نحفظ دعوتك، فمفيش رقم طلب لسه. متحوّلش دلوقتي، لأن من غير الرقم مش هنعرف نربط تحويلك بدعوتك. اتأكد من النت وجرب تاني.',
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
    pendingBanner: 'طلبك وصلنا وبنراجعه.',
    pendingCta: 'شوف حالة الطلب',
    activeBanner: 'دعوتك مفعّلة.',
    activeCta: 'شوف دعوتك',
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
    step: 'Step',
    of: 'of',
    stepData: 'Details',
    stepDesign: 'Design',
    stepPreview: 'Preview',
    stepPayment: 'Payment',
  },

  landing: {
    title: 'An invitation worth sharing',
    subtitle:
      'Build a digital invitation for your engagement or wedding in minutes, then send it to your guests on WhatsApp as a single link.',
    cta: 'Build your invitation',
    sample: 'See a sample invitation',
    sampleNote: 'A sample invitation, so you can see how it looks and moves.',
    sampleCta: 'Make yours',
    sampleBack: 'Back to the site',
    priceLabel: 'Price',
    priceNote: 'One payment, no subscription',
    howTitle: 'How it works',
    step1Title: 'Fill in the details',
    step1Body: 'Names, date, venue. It takes two minutes.',
    step2Title: 'Choose a design and music',
    step2Body: 'Pick a style and watch your invitation change as you go.',
    step3Title: 'Preview, then send',
    step3Body: 'See the whole invitation before you pay, then get a link for your guests.',
    packagesTitle: 'Choose your package',
    packagesSub: 'Every package includes the same designs and music. What changes is how long the link lives, and whether we design something for you.',
    packagesCta: 'Start with this one',
    packagesPopular: 'Most chosen',
    flowTitle: 'How it works, start to finish',
    flowSub: 'No account, no signup. Everything saves as you go.',
    howSteps: [
      {
        title: 'Answer one question at a time',
        body: 'The two names, the date, the venue. One question on screen at a time, and every answer saves itself. No account and no password, so you can close the page and come back later on the same phone.',
      },
      {
        title: 'Choose a design and music',
        body: 'Twelve designs, each with its own typography and its own shape, and you see your own names inside every one before choosing. Listen to the music before you pick it, and drag a photo into the frame until it sits right.',
      },
      {
        title: 'See the whole thing',
        body: 'The invitation opens exactly as a guest will see it, animation and music included. Before you pay, not after.',
      },
      {
        title: 'Pay and send',
        body: 'Transfer over InstaPay, then one button opens WhatsApp with your request number already written. Attach the screenshot and send.',
      },
      {
        title: 'We make it live',
        body: 'A person checks the transfer and activates it. The page you are on updates by itself, and you get two links: one to send your guests, one to edit, which you keep to yourself.',
      },
    ],
    reviewsTitle: 'What couples say',
    reviewsEmpty: 'No reviews published yet. Be the first to write one after your event.',
    reviewsCta: 'Write a review',
    support: 'Need help? Message us on WhatsApp',
    supportMessage: 'Hello, I have a question about the digital invitations',
  },

  flow: {
    start: 'Start',
    resume: 'Carry on',
    resumeHint: 'You started an invitation before. Pick it up where you left it.',
    next: 'Next',
    skip: 'Skip this',
    edit: 'Edit',
    change: 'Change',
    progressLabel: 'Done so far',

    packageTitle: 'Choose your package',
    packageSummary: 'Package',

    name1Title: "What is the groom's name?",
    name1Hint: 'It appears on the invitation exactly as you type it.',
    name1Summary: 'Groom',
    name2Title: "And the bride's name?",
    name2Hint: 'You can change either name later from above.',
    name2Summary: 'Bride',

    occasionTitle: 'What is the occasion?',
    occasionSummary: 'Occasion',

    dateTitle: 'When is it?',
    dateSummary: 'Date',

    timeTitle: 'What time does it start?',
    timeSummary: 'Time',
    timeOther: 'Another time',

    venueTitle: 'Where is it?',
    venueSummary: 'Venue',

    mapTitle: 'Add a Google Maps link?',
    mapPlaceholder: 'e.g. https://maps.app.goo.gl/...',
    mapSkip: 'I do not have one',
    mapSummary: 'Map link',
    mapNone: 'No link',

    messageTitle: 'A message for your guests?',
    messageSkip: 'No message',
    messageSummary: 'Your message',
    messageNone: 'No message',

    langTitle: 'Which language should the invitation be in?',
    langSummary: 'Invitation language',

    themeTitle: 'Choose a design',
    themeSummary: 'Design',

    musicTitle: 'Choose the music',
    musicSummary: 'Music',

    photoTitle: 'Add a photo of the two of you?',
    photoSkip: 'No photo',
    photoSummary: 'Photo',
    photoAdded: 'Photo added',
    photoNone: 'No photo',

    previewTitle: 'Your invitation is ready',
    previewBody: 'Open it and see exactly what your guests will see, animation and music included.',
    previewOpen: 'Open your invitation',
    previewClose: 'Close the preview',
    previewNext: 'Looks right, continue',
    previewSummary: 'Preview',
    previewSeen: 'Seen',

    briefTitle: 'Tell us about the design you want',
    briefSummary: 'Your design brief',

    phoneTitle: 'Your WhatsApp number',
    phoneHint: 'So we can send you your link the moment it goes live.',
    phoneSummary: 'WhatsApp number',

    payTitle: 'One last step',
  },

  build: {
    heading: 'Event details',
    sub: 'Everything saves by itself as you type.',
    eventType: 'Occasion',
    eventTypeEngagement: 'Engagement',
    eventTypeWedding: 'Wedding',
    eventTypeKatbKetab: 'Katb Ketab',
    name1: "Groom's name",
    name1Placeholder: 'e.g. Moaaz',
    name2: "Bride's name",
    name2Placeholder: 'e.g. Reem',
    namesHint: 'Write the names however you like. They appear on the invitation exactly as typed.',
    eventDate: 'Date',
    eventTime: 'Time',
    venueName: 'Venue',
    venuePlaceholder: 'e.g. Janeena Hall',
    venueMapUrl: 'Google Maps link',
    venueMapHint: 'Open the venue in Google Maps, tap share, and paste the link here.',
    customMessage: 'A message for your guests',
    customMessagePlaceholder: 'e.g. Your presence would mean the world to us',
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
    photoUpload: 'Upload photo',
    themeView: 'View this design',
    convertOffer: 'The invitation is in Arabic and the names are written in English. Want them in Arabic? You can still edit the spelling afterwards.',
    convertOfferLatin: 'The invitation is in English and the names are written in Arabic. Want them in English? You can edit the spelling afterwards.',
    scriptMismatchCta: 'Or edit the names yourself',
    themePreviewNote: 'This is a preview of that design. Go back to choose it or try another.',
    themePreviewBack: 'Back to designs',
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
    packageLabel: 'Package',
    customRequestLabel: 'Tell us about the design you want',
    customRequestHint:
      'Colours, style, anything you have seen and liked. The more you tell us, the closer the result will be to what you pictured.',
    methodsLabel: 'Pay here. The button opens the app and copies the address for you',
    payInstapay: 'Pay with InstaPay',
    payVodafone: 'Pay with Vodafone Cash',
    addressCopied: 'Address copied. Paste it in the app and send the amount.',
    afterPayLabel: 'Once you have paid, tap here and someone from the team will message you straight away',
    instapayTitle: 'Pay with InstaPay',
    instapayAddress: 'InstaPay address',
    instapayName: 'Recipient name',
    requestIdLabel: 'Request ID',
    requestIdHint: 'This is what links your transfer to your invitation. Send it with your message.',
    phoneLabel: 'WhatsApp number so we can send you your invitation link',
    phonePlaceholder: 'e.g. 01012345678',
    phoneError: 'Enter a valid Egyptian mobile number',
    whatsappCta: 'Message us on WhatsApp now',
    attachReminder: 'Send them the transfer screenshot and they will send back your invitation link, live and ready to share.',
    afterTitle: 'What happens next',
    afterBody:
      'The chat opens with your request details already written in it, so there is nothing for you to type. We check the transfer by hand, activate the link, and send it back in the same conversation.',
    desktopTitle: 'You are on a computer',
    desktopNote: 'You are on a computer. Open this page on your phone so the pay and WhatsApp buttons work.',
    copyMessage: 'Copy the message',
    notSaved:
      'We could not save your invitation, so it has no request number yet. Please do not transfer anything: without that number we cannot match your payment to your invitation. Check your connection and try again.',
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
    pendingBanner: 'We have your request and are reviewing it.',
    pendingCta: 'See its status',
    activeBanner: 'Your invitation is live.',
    activeCta: 'See your invitation',
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
