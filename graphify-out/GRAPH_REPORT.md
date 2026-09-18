# Graph Report - qlty-invitation  (2026-09-18)

## Corpus Check
- 262 files · ~654,213 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1609 nodes · 4508 edges · 99 communities (74 shown, 25 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f915c382`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Firebase Auth & Data Layer
- Preview & Sample Pages
- Admin Pages & Chrome
- Admin Actions & API Routes
- Iwan Theme
- Music & Photo Upload
- Font Registry
- Card & Layout Primitives
- Build Tooling Dependencies
- Flow Design Sections
- Theme Component Contract
- TypeScript Configuration
- Preview Dialog & Buttons
- Date Formatting & Motion Tokens
- Landing Page & Session
- Header, Reviews & Inputs
- Root Layout & Countdown
- Ghouroub Theme
- Hadiqa Theme
- Theme Catalog v2
- shadcn Component Config
- Payment Panel & Alerts
- Invitation i18n & Mashrabiya
- Verified & Unverified Gaps
- React & Toggle Primitives
- Photo Frame & Qandeel Theme
- Reveal & Theme Sections
- Typography & Verse Rules
- Firestore Ops & Access
- Monogram & Classic Ornaments
- Select Primitive
- Khayamiya Theme
- Logo Wordmark Artwork
- One-Page Flow Decisions
- Flow Reducer & Validation
- Zarf Theme
- Firebase Setup & Backups
- Popover Primitive
- Package Catalog
- Mashrabiya Ornaments
- Styling Utility Dependencies
- Theme Selection Rationale
- App Icon Artwork
- Workflow & Phone Testing
- Public Invitation Page
- Firestore Schemaless Contract
- Accordion Primitive
- Autosave Hook
- Vercel Region Config
- Diagnostics Page
- Brand Logo & Not Available
- login/actions.ts
- admin-auth.ts
- Next.js Proxy Config
- Agent Instruction Files
- admin/actions.ts
- popover.tsx
- Framer Motion Dependency
- heic2any Dependency
- Lucide Icons Dependency
- getTheme
- Next.js Build Config
- slug.ts
- Invitation Theme Set v2
- BoothFaq.tsx
- Radix Label Dependency
- (site)/layout.tsx
- Radix Progress Dependency
- Radix Radio Group Dependency
- invitations.ts
- availability/route.ts
- @radix-ui/react-toggle
- ActionButton.tsx
- Radix Toggle Group Dependency
- React Day Picker Dependency
- photobooth/validation.ts
- [token]/page.tsx
- check-notion.ts
- Zod Dependency
- PostCSS Config
- PaymentPanel.tsx
- Light Ground Ladder
- Reduced Motion Contract
- ImageKit Setup
- Sample OG Content Type
- Sample OG Image Size
- Invitation OG Content Type
- Invitation OG Image Size
- proxy.ts
- firebase-admin
- packages.ts
- heic2any
- AvailabilityCalendar.tsx
- SiteFooter.tsx
- toggle-group.tsx
- events.test.ts
- (site)/layout.tsx
- @radix-ui/react-scroll-area

## God Nodes (most connected - your core abstractions)
1. `cn()` - 222 edges
2. `InvitationView` - 38 edges
3. `Lang` - 38 edges
4. `boothReservations()` - 36 edges
5. `InvitationCopy` - 30 edges
6. `Dictionary` - 29 edges
7. `formatEventDate()` - 27 edges
8. `formatEventDateParts()` - 26 edges
9. `formatEventTimeParts()` - 26 edges
10. `metaTrack()` - 24 edges

## Surprising Connections (you probably didn't know these)
- `Dev Server Stale Chunk 404 on Phones` --semantically_similar_to--> `qlty_step Progress Cookie`  [AMBIGUOUS] [semantically similar]
  CONTRIBUTING.md → README.md
- `Phone Testing Against a Production Build` --semantically_similar_to--> `Nothing Verified on a Physical Phone`  [INFERRED] [semantically similar]
  CONTRIBUTING.md → README.md
- `Single Operator Account, Public Signup Disabled` --semantically_similar_to--> `No Customer Accounts, Secret Token Access Only`  [INFERRED] [semantically similar]
  CONTRIBUTING.md → README.md
- `src/lib/types.ts Is Hand Written` --semantically_similar_to--> `Hand Written Data Model (src/lib/types.ts)`  [INFERRED] [semantically similar]
  CONTRIBUTING.md → README.md
- `InstaPay Recipient Variables` --conceptually_related_to--> `The One Page Flow`  [INFERRED]
  SETUP.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **The Four Load Bearing Rules of the One Page Flow** — readme_one_page_flow, readme_topatch_all_or_nothing, readme_empty_date_and_time, readme_qlty_step_cookie, readme_preview_dialog_cover [EXTRACTED 1.00]
- **Arabic and Bidi Rendering Hazards** — readme_bdi_direction_rule, readme_bismillah_container_query, readme_satori_arabic_reversal, readme_satori_font_compatibility, readme_arabic_diacritic_regex_escapes, readme_slug_transliteration, readme_arabic_font_subsetting_by_range [INFERRED 0.85]
- **Gaps That Cannot Be Closed From a Desktop** — readme_heic_unverified, readme_audio_unverified, readme_physical_phone_unverified, contributing_phone_testing_mandatory [EXTRACTED 1.00]
- **The Nine Shipped Themes** — docs_theme_set_v2_hadiqa, docs_theme_set_v2_iwan, docs_theme_set_v2_ghouroub, docs_theme_set_v2_mashrabiya, docs_theme_set_v2_qandeel, docs_theme_set_v2_khayamiya, docs_theme_set_v2_netiga, docs_theme_set_v2_zarf, docs_theme_set_v2_rizma [EXTRACTED 1.00]
- **Four-Path Colour Layer Stack Composing the Lockup** — public_logo_gold_layer, public_logo_cream_layer, public_logo_warm_gray_layer, public_logo_dark_brown_layer, public_logo_qlty_events_lockup [EXTRACTED 1.00]
- **Three-Layer Knockout Composition of the Brand Mark** — src_app_icon_gold_badge_path, src_app_icon_cream_glyph_path, src_app_icon_dark_detail_path, src_app_icon_qlty_events_mark [EXTRACTED 1.00]

## Communities (99 total, 25 thin omitted)

### Community 0 - "Firebase Auth & Data Layer"
Cohesion: 0.09
Nodes (22): between(), ConfettiBurst(), makeParticle(), Particle, pick(), classic, ConfettiRecipe, ConfettiShape (+14 more)

### Community 1 - "Preview & Sample Pages"
Cohesion: 0.19
Nodes (19): CardReviewPage(), metadata, EVENT_TYPES, metadata, PreviewFramePage(), ArrowButton(), CoverStage(), ThemePicker() (+11 more)

### Community 2 - "Admin Pages & Chrome"
Cohesion: 0.16
Nodes (10): Reviews(), LoadedDraft, SAMPLE_QUOTES, BoothSource, BoothSyncCursor, BoothSyncStatus, Invitation, Review (+2 more)

### Community 3 - "Admin Actions & API Routes"
Cohesion: 0.17
Nodes (10): react, react, Badge(), badgeVariants, Separator(), Skeleton(), ToggleGroupContext, ToggleGroupItem() (+2 more)

### Community 4 - "Iwan Theme"
Cohesion: 0.07
Nodes (35): BAR, INSCRIPTION, IwanCover(), leafVariants(), LEAVES, PORTAL, AblaqCourses(), APEX_CELLS (+27 more)

### Community 5 - "Music & Photo Upload"
Cohesion: 0.08
Nodes (38): BoothCalendarPage(), Legend(), resolveMonth(), shiftMonth(), WEEKDAYS, BoothDetailPage(), SOURCE_LABELS, NewBoothBookingPage() (+30 more)

### Community 6 - "Font Registry"
Cohesion: 0.05
Nodes (42): alegreyaSans, alexandria, alice, almarai, amiri, amiriQuran, archivo, arefRuqaa (+34 more)

### Community 7 - "Card & Layout Primitives"
Cohesion: 0.06
Nodes (36): Field(), Row(), SyncBadge(), Corner(), Card(), CardAction(), CardContent(), CardDescription() (+28 more)

### Community 8 - "Build Tooling Dependencies"
Cohesion: 0.10
Nodes (21): dotenv, devDependencies, dotenv, postcss, tailwindcss, @tailwindcss/postcss, tsx, tw-animate-css (+13 more)

### Community 9 - "Flow Design Sections"
Cohesion: 0.54
Nodes (7): reviews(), createReview(), getAllReviews(), getApprovedReviews(), getPendingReviews(), mapReview(), ReviewInput

### Community 10 - "Theme Component Contract"
Cohesion: 0.20
Nodes (5): metadata, viewport, SITE_URL, config, proxy()

### Community 11 - "TypeScript Configuration"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 12 - "Preview Dialog & Buttons"
Cohesion: 0.17
Nodes (14): startOver(), StartOverButton(), Button(), buttonVariants, Calendar(), CalendarDayButton(), Dialog(), DialogContent() (+6 more)

### Community 13 - "Date Formatting & Motion Tokens"
Cohesion: 0.08
Nodes (43): main(), notion(), TOKEN, DUMP, main(), notion(), OldRow, readNumber() (+35 more)

### Community 14 - "Landing Page & Session"
Cohesion: 0.14
Nodes (17): PhotoBoothPage(), InstagramStrip(), ServiceCard(), SiteImage(), ADD_ON_BY_ID, BOOTH_BY_ID, BOOTH_CLOSED_WEEKDAYS, BoothAddOn (+9 more)

### Community 15 - "Header, Reviews & Inputs"
Cohesion: 0.11
Nodes (41): main(), authorised(), GET(), GET(), QuerySchema, readAvailability, handoffToWhatsApp(), boothReservationHistory() (+33 more)

### Community 16 - "Root Layout & Countdown"
Cohesion: 0.27
Nodes (9): main(), reportBoothPurchase(), buildUserData(), hashPhone(), isCapiConfigured(), MetaServerEvent, sendMetaEvent(), toUserData() (+1 more)

### Community 17 - "Ghouroub Theme"
Cohesion: 0.12
Nodes (18): BUTTON, CONTENT, GhouroubCover(), GROUND, HAZE, SKY, SUN, GAP_TRAVEL (+10 more)

### Community 18 - "Hadiqa Theme"
Cohesion: 0.11
Nodes (18): CONTENT, HadiqaCover(), petalVariants(), STEM, Block(), useReducedMotion(), BUD_ANGLES, JasmineBlossom() (+10 more)

### Community 19 - "Theme Catalog v2"
Cohesion: 0.15
Nodes (19): Considered And Dropped Concepts, Three Built Then Cut Themes, Floral Legacy Theme, Ghouroub Theme, Hadiqa Theme, Iwan Theme, Khayamiya Theme, Lawh Theme (+11 more)

### Community 20 - "shadcn Component Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 21 - "Payment Panel & Alerts"
Cohesion: 0.23
Nodes (13): POST(), recordMetaAttribution(), MetaUserData, isBrowserReportable(), isKnownEvent(), KNOWN, SERVER_ONLY, clientIp() (+5 more)

### Community 22 - "Invitation i18n & Mashrabiya"
Cohesion: 0.27
Nodes (15): BoothQueuePage(), boothReservations(), CalendarDay, findBoothReservations(), getBookingsAwaitingCompletion(), getBoothMonth(), getBoothQueue(), getBoothQueueCount() (+7 more)

### Community 23 - "Verified & Unverified Gaps"
Cohesion: 0.14
Nodes (16): Working On This Together (Contributor Guide), Arabic Diacritic Ranges Must Use \u Escapes, Arabic Fonts Subset by Unicode Range, Backup Scheduling Not Automated, Never Force Direction on Text Containing Arabic, Fourteen Stage Build Order, expiresAt Has No Policy Yet, HEIC Decoding Unverified (+8 more)

### Community 24 - "React & Toggle Primitives"
Cohesion: 0.17
Nodes (12): CONTAINER_VARIANTS, FLAP_BOTTOM_VARIANTS, FLAP_LEFT_VARIANTS, FLAP_RIGHT_VARIANTS, FLAP_TOP_VARIANTS, SEAL_LEFT_VARIANTS, SEAL_RIGHT_VARIANTS, WHOLE_SEAL_VARIANTS (+4 more)

### Community 25 - "Photo Frame & Qandeel Theme"
Cohesion: 0.27
Nodes (12): SamplePage(), generateMetadata(), InvitationsPage(), generateMetadata(), generateMetadata(), HowItWorks(), getDictionary(), loadDraft() (+4 more)

### Community 26 - "Reveal & Theme Sections"
Cohesion: 0.35
Nodes (7): Monogram(), Divider(), OrnateFrame(), PaperTexture(), Pip(), initialOf(), ClassicCover()

### Community 27 - "Typography & Verse Rules"
Cohesion: 0.20
Nodes (12): Amiri Quran As The Verse Face Only, Classic Legacy Theme, Type Register Spread, Quranic Text Never Sits On A Pattern, Bismillah Glyph Container Query Sizing, Single Bordered Details Panel, Africa/Cairo Date and Time Resolution, Classic Theme Composition (+4 more)

### Community 28 - "Firestore Ops & Access"
Cohesion: 0.22
Nodes (11): Who Can Reach What, .env Secrets Handling, Firestore Emulator for Local Development, Single Operator Account, Public Signup Disabled, Test Invitations Pile Up in the Admin List, In-Memory Admin Query Filtering, admin.qlty.events Subdomain Routing, Firestore as the Datastore (+3 more)

### Community 29 - "Monogram & Classic Ornaments"
Cohesion: 0.04
Nodes (46): 1. The transport fee outside Cairo and Giza, 2. The invitations photograph on the home, 3. The hero video, if you want one, A note on the 6000, Still open, What is now real, for the record, What still needs real values, A1. Booth content — done (+38 more)

### Community 30 - "Select Primitive"
Cohesion: 0.29
Nodes (8): CONTAINER_VARIANTS, KhayamiyaCover(), LEFT_FLAP_VARIANTS, RIGHT_FLAP_VARIANTS, EightPetalMedallion(), LotusPalmette(), RunningStitchSeam(), SteppedMerlonBorder()

### Community 31 - "Khayamiya Theme"
Cohesion: 0.41
Nodes (15): assertId(), blockDay(), cancelBooking(), changeBookingDate(), completeBooking(), confirmBooking(), createManualBooking(), editBooking() (+7 more)

### Community 32 - "Logo Wordmark Artwork"
Cohesion: 0.42
Nodes (10): qlty Brand Palette (Gold, Cream, Warm Grey, Dark Brown), Cream Layer (#faf5ef), Dark Brown Layer (#3b2a20), .events Badge Plate, Gold Layer (#b8924b), qlty.events Brand Lockup, Rounded-Square q Mark (App-Icon Tile), Traced-Vector Lockup (No Embedded Fonts or Rasters) (+2 more)

### Community 33 - "One-Page Flow Decisions"
Cohesion: 0.24
Nodes (10): Audio Requires a Synchronous Tap, Music Library Empty, Audio Unproven, Date and Time Start Empty, Legacy /build Route Redirects, The One Page Flow, Preview Dialog Mounted on the Unopened Cover, qlty.events Digital Invitations, shadcn/ui Token Slots Pointed at Brand Values (+2 more)

### Community 34 - "Flow Reducer & Validation"
Cohesion: 0.11
Nodes (18): 0. Context Claude Code must respect, 1. Inputs Rashad fills in before running (put them in `src/lib/photobooth/config.ts` and `.env`), 2. Target site map, 7.1 Notion database (Rashad creates it, Claude Code writes `docs/notion-booth-setup.md` with exact steps), 7.2 Outbound (site or admin to Notion), 7.3 Inbound (Notion to site), 7.4 Reconcile (safety net, because webhooks can be late or dropped), Build plan: QLTY home, Photo Booth rental, Notion sync, qlty.events launch (+10 more)

### Community 35 - "Zarf Theme"
Cohesion: 0.15
Nodes (21): formatEventDateParts(), formatEventTime(), formatEventTimeParts(), formatEventWeekday(), locale(), ClassicInvitation(), CardComponent, CoverComponent (+13 more)

### Community 36 - "Firebase Setup & Backups"
Cohesion: 0.25
Nodes (9): Backup Runbook, Composite Indexes And Rules Deploy, Firebase Project Provisioning, Local Firestore Emulator, Firestore eur3 Location Choice, Deny Everything Firestore Rules, Service Account Credentials, Vercel Functions Pinned To fra1 (+1 more)

### Community 37 - "Popover Primitive"
Cohesion: 0.23
Nodes (10): BoothGallery(), BoothPackages(), HomeHeader(), LanguageToggle(), AR, DICTIONARIES, Dictionary, EN (+2 more)

### Community 38 - "Package Catalog"
Cohesion: 0.30
Nodes (13): PhotoFrame(), PhotoShape, SHAPES, Reveal(), InvitationView, CountdownBlock(), DateBlock(), FooterBlock() (+5 more)

### Community 39 - "Mashrabiya Ornaments"
Cohesion: 0.07
Nodes (57): activateInvitation(), changeSlug(), deactivateInvitation(), extendExpiry(), rejectInvitation(), revalidateInvitation(), AllInvitationsPage(), FILTERS (+49 more)

### Community 40 - "Styling Utility Dependencies"
Cohesion: 0.08
Nodes (25): clsx, date-fns, framer-motion, heic2any, next, dependencies, clsx, date-fns (+17 more)

### Community 41 - "Theme Selection Rationale"
Cohesion: 0.17
Nodes (18): BoothViewedBeacon(), MetaPixel(), CONTENT_CATEGORIES, ContentCategory, CUSTOM_EVENTS, CustomEvent, isStandardEvent(), MetaEventName (+10 more)

### Community 42 - "App Icon Artwork"
Cohesion: 0.43
Nodes (7): Warm Gold-Cream-Espresso Brand Palette, Cream Glyph Path (#faf5ef), Dark Brown Detail Path (#3b2a20), Gold Badge Path (#b8924b), Next.js app/icon.svg File Convention, qlty.events Brand Mark (app icon), Hand-Traced Vector Provenance

### Community 43 - "Workflow & Phone Testing"
Cohesion: 0.40
Nodes (6): Branch and Pull Request Workflow, Dev Server Stale Chunk 404 on Phones, Phone Testing Against a Production Build, clampFurthest, Nothing Verified on a Physical Phone, qlty_step Progress Cookie

### Community 44 - "Public Invitation Page"
Cohesion: 0.17
Nodes (8): EVENTS, PITCHES, SizeId, SIZES, SWATCH_KEYS, VERSE_OPTIONS, VERSES, THEMES

### Community 45 - "Firestore Schemaless Contract"
Cohesion: 0.60
Nodes (5): Firestore Has No Migrations, src/lib/types.ts Is Hand Written, InvitationRecord Document Shape, toPatch All-or-Nothing Rule, Hand Written Data Model (src/lib/types.ts)

### Community 46 - "Accordion Primitive"
Cohesion: 0.27
Nodes (8): CONTAINER_VARIANTS, LAMP_FAR_VARIANTS, LAMP_MID_VARIANTS, LAMP_NEAR_VARIANTS, QandeelCover(), MosqueLamp(), PLUMB_LENGTHS, PlumbLine()

### Community 47 - "Autosave Hook"
Cohesion: 0.36
Nodes (4): ReviewForm(), Input(), Label(), Textarea()

### Community 48 - "Vercel Region Config"
Cohesion: 0.40
Nodes (4): fra1, crons, regions, $schema

### Community 50 - "Brand Logo & Not Available"
Cohesion: 0.25
Nodes (4): PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle()

### Community 51 - "login/actions.ts"
Cohesion: 0.21
Nodes (14): clientKey(), LoginState, signIn(), signOut(), LoginForm(), AdminLoginPage(), SignOutControl(), firebaseApp() (+6 more)

### Community 52 - "admin-auth.ts"
Cohesion: 0.29
Nodes (7): Bobbin(), BobbinDivider(), GRILLE_CELLS, HexagonalVoid(), hexagonPoints(), SixLobedRosette(), TurnedGrille()

### Community 53 - "Next.js Proxy Config"
Cohesion: 0.11
Nodes (43): booking(), cleanup(), DATE, main(), boothDays(), toDate(), toDateOr(), getBoothDayDoc() (+35 more)

### Community 55 - "admin/actions.ts"
Cohesion: 0.50
Nodes (4): Alert(), AlertDescription(), AlertTitle(), alertVariants

### Community 56 - "popover.tsx"
Cohesion: 0.06
Nodes (56): POST(), SampleOgImage(), InvitationOgImage(), generateMetadata(), InvitationPage(), loadActiveInvitation(), Params, MusicSelector() (+48 more)

### Community 57 - "Framer Motion Dependency"
Cohesion: 0.23
Nodes (9): HomePage(), BoothHero(), Hero(), HowItWorksCompact(), PriceTag(), ContinueDraft(), BOOTH_MEDIA, boothStartingPrice() (+1 more)

### Community 58 - "heic2any Dependency"
Cohesion: 0.29
Nodes (7): Contrast Token Contract, Coverage Not Score Selection Rule, Mid Range Android Performance Budget, Rizma Theme, Tayya Dropped Concept, Invitation Theme Set v2, Eight Music Files In public music

### Community 60 - "getTheme"
Cohesion: 0.09
Nodes (41): InvitationFlow(), reducer(), PhotoCropper(), Transform, ERROR_KEYS, Stage, isSectionActive(), isSkippable() (+33 more)

### Community 64 - "BoothFaq.tsx"
Cohesion: 0.48
Nodes (5): BoothFaq(), Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger()

### Community 66 - "(site)/layout.tsx"
Cohesion: 0.47
Nodes (3): CopyValue(), CopyField(), copyText()

### Community 68 - "Radix Radio Group Dependency"
Cohesion: 0.36
Nodes (8): AvailabilityCalendar(), dateKey(), DayMap, LegendItem(), monthKey(), toLocalDate(), boothWhatsappLink(), buildBoothEnquiryMessage()

### Community 69 - "invitations.ts"
Cohesion: 0.07
Nodes (49): BACKUP_DIR, main(), plain(), stamp(), main(), GET(), POST(), CONTENT_FIELDS (+41 more)

### Community 70 - "availability/route.ts"
Cohesion: 0.43
Nodes (4): SiteFooter(), TrackedSupportButton(), SupportButton(), whatsappLink()

### Community 71 - "@radix-ui/react-toggle"
Cohesion: 0.43
Nodes (4): InvitationExperience(), MuteToggle(), InvitationAudio, useInvitationAudio()

### Community 72 - "ActionButton.tsx"
Cohesion: 0.47
Nodes (3): metadata, SampleViewedBeacon(), BackLink()

### Community 76 - "[token]/page.tsx"
Cohesion: 0.27
Nodes (6): BoothStatusPage(), metadata, TONE, BrandLogo(), getReservationByStatusToken(), buildBoothSupportMessage()

### Community 89 - "proxy.ts"
Cohesion: 0.10
Nodes (24): AR, COPY, EN, EventCopy, InvitationCopy, formatEventDate(), DURATION, EASE_DRAWER (+16 more)

### Community 91 - "packages.ts"
Cohesion: 0.13
Nodes (20): POST(), HandoffResult, requestBooking(), RequestBookingResult, BoothBooking(), NativeSelect(), Row(), Stage (+12 more)

### Community 93 - "AvailabilityCalendar.tsx"
Cohesion: 0.15
Nodes (13): scripts, backup, build, check:booth, check:meta, check:music, check:notion, dev (+5 more)

### Community 96 - "toggle-group.tsx"
Cohesion: 0.08
Nodes (33): AnsweredRow(), LanguageSection(), MusicSection(), PhotoSection(), PreviewSection(), ThemeSection(), FlowHeader(), Action (+25 more)

### Community 100 - "events.test.ts"
Cohesion: 0.14
Nodes (19): Countdown(), Parts, partsUntil(), useCountdownParts(), KhayamiyaCountdown(), MashrabiyaCountdown(), CONTAINER_VARIANTS, NetigaCover() (+11 more)

### Community 101 - "(site)/layout.tsx"
Cohesion: 0.25
Nodes (11): SiteLayout(), DirectionProvider(), InvitationShell(), MiniInvitation(), Rule(), SyncDocumentLang(), Toaster(), dirFor() (+3 more)

### Community 104 - "@radix-ui/react-scroll-area"
Cohesion: 0.33
Nodes (5): name, overrides, jose, private, version

## Ambiguous Edges - Review These
- `Gold Layer (#b8924b)` → `Dark Brown Layer (#3b2a20)`  [AMBIGUOUS]
  public/logo.svg · relation: shares_data_with
- `qlty_step Progress Cookie` → `Dev Server Stale Chunk 404 on Phones`  [AMBIGUOUS]
  CONTRIBUTING.md · relation: semantically_similar_to
- `Backup Scheduling Not Automated` → `expiresAt Has No Policy Yet`  [AMBIGUOUS]
  README.md · relation: semantically_similar_to

## Knowledge Gaps
- **403 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+398 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Gold Layer (#b8924b)` and `Dark Brown Layer (#3b2a20)`?**
  _Edge tagged AMBIGUOUS (relation: shares_data_with) - confidence is low._
- **What is the exact relationship between `qlty_step Progress Cookie` and `Dev Server Stale Chunk 404 on Phones`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `Backup Scheduling Not Automated` and `expiresAt Has No Policy Yet`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **Why does `cn()` connect `Card & Layout Primitives` to `Preview & Sample Pages`, `Admin Actions & API Routes`, `Iwan Theme`, `Music & Photo Upload`, `Preview Dialog & Buttons`, `Landing Page & Session`, `Ghouroub Theme`, `Hadiqa Theme`, `React & Toggle Primitives`, `Reveal & Theme Sections`, `Select Primitive`, `Zarf Theme`, `Popover Primitive`, `Package Catalog`, `Mashrabiya Ornaments`, `Accordion Primitive`, `Autosave Hook`, `Brand Logo & Not Available`, `admin-auth.ts`, `admin/actions.ts`, `popover.tsx`, `BoothFaq.tsx`, `(site)/layout.tsx`, `Radix Radio Group Dependency`, `availability/route.ts`, `ActionButton.tsx`, `[token]/page.tsx`, `proxy.ts`, `packages.ts`, `toggle-group.tsx`, `events.test.ts`, `(site)/layout.tsx`?**
  _High betweenness centrality (0.237) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Styling Utility Dependencies` to `Radix Label Dependency`, `Radix Progress Dependency`, `Admin Actions & API Routes`, `@radix-ui/react-scroll-area`, `Radix Toggle Group Dependency`, `React Day Picker Dependency`, `photobooth/validation.ts`, `check-notion.ts`, `Zod Dependency`, `PaymentPanel.tsx`, `SiteFooter.tsx`, `firebase-admin`, `Lucide Icons Dependency`, `heic2any`, `slug.ts`, `Invitation Theme Set v2`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Why does `react` connect `Admin Actions & API Routes` to `Styling Utility Dependencies`, `Preview Dialog & Buttons`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _403 weakly-connected nodes found - possible documentation gaps or missing edges._