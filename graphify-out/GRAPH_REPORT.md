# Graph Report - qlty-invitation  (2026-09-17)

## Corpus Check
- 227 files · ~182,892 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1359 nodes · 3608 edges · 97 communities (62 shown, 35 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 47 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9a629935`
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
- Radix UI Root Dependency
- Radix Accordion Dependency
- Radix Dialog Dependency
- Radix Label Dependency
- Radix Popover Dependency
- Radix Progress Dependency
- Radix Radio Group Dependency
- Radix Scroll Area Dependency
- Radix Separator Dependency
- Radix Slot Dependency
- Radix Toggle Dependency
- Radix Toggle Group Dependency
- React Day Picker Dependency
- React DOM Dependency
- Sonner Toast Dependency
- tailwind-merge Dependency
- Zod Dependency
- PostCSS Config
- Invitation Theme Set v2
- Light Ground Ladder
- Reduced Motion Contract
- ImageKit Setup
- Sample OG Content Type
- Sample OG Image Size
- Invitation OG Content Type
- Invitation OG Image Size
- firebase-admin
- packages.ts
- utils.ts
- (site)/layout.tsx
- CopyValue.tsx
- useAutosave.ts
- calendar.tsx
- badge.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 206 edges
2. `InvitationView` - 38 edges
3. `Lang` - 35 edges
4. `InvitationCopy` - 30 edges
5. `formatEventDate()` - 27 edges
6. `formatEventDateParts()` - 26 edges
7. `formatEventTimeParts()` - 26 edges
8. `getTheme()` - 24 edges
9. `Dictionary` - 23 edges
10. `Button()` - 21 edges

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

## Communities (97 total, 35 thin omitted)

### Community 0 - "Firebase Auth & Data Layer"
Cohesion: 0.09
Nodes (42): GET(), POST(), CONTENT_FIELDS, hasContent(), POST(), GET(), POST(), GET() (+34 more)

### Community 1 - "Preview & Sample Pages"
Cohesion: 0.08
Nodes (26): between(), ConfettiBurst(), makeParticle(), Particle, pick(), MuteToggle(), InvitationAudio, useInvitationAudio() (+18 more)

### Community 2 - "Admin Pages & Chrome"
Cohesion: 0.06
Nodes (71): GET(), QuerySchema, readAvailability, POST(), HandoffResult, handoffToWhatsApp(), requestBooking(), RequestBookingResult (+63 more)

### Community 3 - "Admin Actions & API Routes"
Cohesion: 0.16
Nodes (21): DIGRAPHS, REVERSE_DICTIONARY, SINGLES, suggestArabicName(), suggestLatinName(), transliterateWord(), hasArabicLetters(), ARABIC_INDIC_DIGITS (+13 more)

### Community 4 - "Iwan Theme"
Cohesion: 0.07
Nodes (37): BAR, INSCRIPTION, IwanCover(), leafVariants(), LEAVES, PORTAL, Course(), Tier (+29 more)

### Community 5 - "Music & Photo Upload"
Cohesion: 0.21
Nodes (13): PhotoCropper(), Transform, ERROR_KEYS, PhotoUpload(), Stage, ACCEPTED, checkFileType(), looksHeic() (+5 more)

### Community 6 - "Font Registry"
Cohesion: 0.05
Nodes (42): alegreyaSans, alexandria, alice, almarai, amiri, amiriQuran, archivo, arefRuqaa (+34 more)

### Community 7 - "Card & Layout Primitives"
Cohesion: 0.05
Nodes (39): AnsweredRow(), ArrowButton(), Rule(), Corner(), AccordionContent(), AccordionItem(), AccordionTrigger(), Card() (+31 more)

### Community 8 - "Build Tooling Dependencies"
Cohesion: 0.06
Nodes (34): dotenv, devDependencies, dotenv, postcss, tailwindcss, @tailwindcss/postcss, tsx, tw-animate-css (+26 more)

### Community 9 - "Flow Design Sections"
Cohesion: 0.13
Nodes (21): Action, FlowState, BriefSection(), COMMON_TIMES, DateSection(), MessageSection(), NameSection(), NativePickerField() (+13 more)

### Community 10 - "Theme Component Contract"
Cohesion: 0.26
Nodes (12): formatEventDateParts(), formatEventTimeParts(), ClassicInvitation(), IwanInvitation(), KhayamiyaInvitation(), MashrabiyaInvitation(), QandeelInvitation(), RizmaInvitation() (+4 more)

### Community 11 - "TypeScript Configuration"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 12 - "Preview Dialog & Buttons"
Cohesion: 0.17
Nodes (11): startOver(), PreviewDialog(), StartOverButton(), Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader() (+3 more)

### Community 13 - "Date Formatting & Motion Tokens"
Cohesion: 0.07
Nodes (49): Monogram(), Divider(), OrnateFrame(), PaperTexture(), Pip(), InvitationCopy, formatEventDate(), formatEventWeekday() (+41 more)

### Community 14 - "Landing Page & Session"
Cohesion: 0.26
Nodes (16): activateInvitation(), changeSlug(), deactivateInvitation(), extendExpiry(), rejectInvitation(), revalidateInvitation(), ApprovalPage(), FIELD_LABELS (+8 more)

### Community 15 - "Header, Reviews & Inputs"
Cohesion: 0.14
Nodes (12): EVENTS, PITCHES, SizeId, SIZES, SWATCH_KEYS, VERSE_OPTIONS, getVerse(), isValidVerseId() (+4 more)

### Community 16 - "Root Layout & Countdown"
Cohesion: 0.27
Nodes (10): CONTAINER_VARIANTS, NetigaCover(), TEAR_LEAF_VARIANTS_LTR, TEAR_LEAF_VARIANTS_RTL, Leaf(), NetigaCountdown(), NetigaInvitation(), CalendarHeaderBand() (+2 more)

### Community 17 - "Ghouroub Theme"
Cohesion: 0.17
Nodes (13): Band(), GAP_TRAVEL, GhouroubCountdown(), GhouroubInvitation(), GROUND, HAZE_STEPS, SKY, useHazeStep() (+5 more)

### Community 18 - "Hadiqa Theme"
Cohesion: 0.13
Nodes (15): Block(), HadiqaInvitation(), useReducedMotion(), BUD_ANGLES, JasmineBlossom(), JasmineBud(), JasminePetal(), JasmineTendril() (+7 more)

### Community 19 - "Theme Catalog v2"
Cohesion: 0.13
Nodes (21): Considered And Dropped Concepts, Three Built Then Cut Themes, Floral Legacy Theme, Ghouroub Theme, Hadiqa Theme, Iwan Theme, Khayamiya Theme, Lawh Theme (+13 more)

### Community 20 - "shadcn Component Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 21 - "Payment Panel & Alerts"
Cohesion: 0.14
Nodes (25): AllInvitationsPage(), FILTERS, Props, DraftsPage(), AdminHome(), Props, AdminHeader(), EmptyState() (+17 more)

### Community 22 - "Invitation i18n & Mashrabiya"
Cohesion: 0.26
Nodes (15): PhotoShape, SHAPES, viewFromValues(), getEventInstant(), toInvitationView(), getTrack(), isValidTrackId(), MusicTrack (+7 more)

### Community 23 - "Verified & Unverified Gaps"
Cohesion: 0.14
Nodes (16): Working On This Together (Contributor Guide), Arabic Diacritic Ranges Must Use \u Escapes, Arabic Fonts Subset by Unicode Range, Backup Scheduling Not Automated, Never Force Direction on Text Containing Arabic, Fourteen Stage Build Order, expiresAt Has No Policy Yet, HEIC Decoding Unverified (+8 more)

### Community 24 - "React & Toggle Primitives"
Cohesion: 0.07
Nodes (41): POST(), metadata, MetaPixel(), SampleViewedBeacon(), BackLink(), TrackedSupportButton(), SupportButton(), recordMetaAttribution() (+33 more)

### Community 25 - "Photo Frame & Qandeel Theme"
Cohesion: 0.15
Nodes (13): Countdown(), Parts, partsUntil(), AR, COPY, EN, EventCopy, verseSource() (+5 more)

### Community 26 - "Reveal & Theme Sections"
Cohesion: 0.25
Nodes (15): PhotoFrame(), Reveal(), FloralInvitation(), FloralDivider(), Sprig(), MidnightInvitation(), ModernInvitation(), CountdownBlock() (+7 more)

### Community 27 - "Typography & Verse Rules"
Cohesion: 0.20
Nodes (12): Amiri Quran As The Verse Face Only, Classic Legacy Theme, Type Register Spread, Quranic Text Never Sits On A Pattern, Bismillah Glyph Container Query Sizing, Single Bordered Details Panel, Africa/Cairo Date and Time Resolution, Classic Theme Composition (+4 more)

### Community 28 - "Firestore Ops & Access"
Cohesion: 0.22
Nodes (11): Who Can Reach What, .env Secrets Handling, Firestore Emulator for Local Development, Single Operator Account, Public Signup Disabled, Test Invitations Pile Up in the Admin List, In-Memory Admin Query Filtering, admin.qlty.events Subdomain Routing, Firestore as the Datastore (+3 more)

### Community 29 - "Monogram & Classic Ornaments"
Cohesion: 0.18
Nodes (16): BACKUP_DIR, main(), stamp(), main(), boothReservationHistory(), COLLECTIONS, credentials(), missing() (+8 more)

### Community 30 - "Select Primitive"
Cohesion: 0.18
Nodes (5): metadata, viewport, SiteFooter(), SITE_URL, whatsappLink()

### Community 31 - "Khayamiya Theme"
Cohesion: 0.24
Nodes (10): useCountdownParts(), KhayamiyaCountdown(), EightPetalMedallion(), LotusPalmette(), RunningStitchSeam(), SteppedMerlonBorder(), MashrabiyaCountdown(), QandeelCountdown() (+2 more)

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
Cohesion: 0.22
Nodes (15): InvitationFlow(), MapSection(), clampFurthest(), emptyValues(), FlowValues, inferFurthest(), isAnswered(), toPatch() (+7 more)

### Community 36 - "Firebase Setup & Backups"
Cohesion: 0.25
Nodes (9): Backup Runbook, Composite Indexes And Rules Deploy, Firebase Project Provisioning, Local Firestore Emulator, Firestore eur3 Location Choice, Deny Everything Firestore Rules, Service Account Credentials, Vercel Functions Pinned To fra1 (+1 more)

### Community 38 - "Package Catalog"
Cohesion: 0.28
Nodes (14): reducer(), isSectionActive(), isSkippable(), nextSection(), progressPercent(), SECTION_ORDER, SectionId, sectionIndex() (+6 more)

### Community 39 - "Mashrabiya Ornaments"
Cohesion: 0.36
Nodes (7): Bobbin(), BobbinDivider(), GRILLE_CELLS, HexagonalVoid(), hexagonPoints(), SixLobedRosette(), TurnedGrille()

### Community 40 - "Styling Utility Dependencies"
Cohesion: 0.29
Nodes (7): class-variance-authority, date-fns, dependencies, class-variance-authority, date-fns, @radix-ui/react-select, @radix-ui/react-select

### Community 41 - "Theme Selection Rationale"
Cohesion: 0.21
Nodes (14): SamplePage(), generateMetadata(), InvitationsPage(), generateMetadata(), HomePage(), ReviewForm(), Reviews(), getDictionary() (+6 more)

### Community 42 - "App Icon Artwork"
Cohesion: 0.43
Nodes (7): Warm Gold-Cream-Espresso Brand Palette, Cream Glyph Path (#faf5ef), Dark Brown Detail Path (#3b2a20), Gold Badge Path (#b8924b), Next.js app/icon.svg File Convention, qlty.events Brand Mark (app icon), Hand-Traced Vector Provenance

### Community 43 - "Workflow & Phone Testing"
Cohesion: 0.40
Nodes (6): Branch and Pull Request Workflow, Dev Server Stale Chunk 404 on Phones, Phone Testing Against a Production Build, clampFurthest, Nothing Verified on a Physical Phone, qlty_step Progress Cookie

### Community 44 - "Public Invitation Page"
Cohesion: 0.16
Nodes (14): react, react, LanguageSection(), MusicSection(), PhotoSection(), PreviewSection(), ThemeSection(), SectionShell() (+6 more)

### Community 45 - "Firestore Schemaless Contract"
Cohesion: 0.60
Nodes (5): Firestore Has No Migrations, src/lib/types.ts Is Hand Written, InvitationRecord Document Shape, toPatch All-or-Nothing Rule, Hand Written Data Model (src/lib/types.ts)

### Community 46 - "Accordion Primitive"
Cohesion: 0.15
Nodes (14): PendingBanner(), Alert(), AlertDescription(), AlertTitle(), alertVariants, BoothReservation, BoothSource, BoothStatus (+6 more)

### Community 47 - "Autosave Hook"
Cohesion: 0.24
Nodes (23): SiteLayout(), CardReviewPage(), metadata, EVENT_TYPES, metadata, PreviewFramePage(), CoverStage(), ThemePicker() (+15 more)

### Community 48 - "Vercel Region Config"
Cohesion: 0.50
Nodes (3): fra1, regions, $schema

### Community 50 - "Brand Logo & Not Available"
Cohesion: 0.16
Nodes (16): SampleOgImage(), InvitationOgImage(), generateMetadata(), InvitationPage(), loadActiveInvitation(), Params, ViewBeacon(), getBySlug() (+8 more)

### Community 51 - "login/actions.ts"
Cohesion: 0.19
Nodes (16): clientKey(), LoginState, signIn(), signOut(), LoginForm(), AdminLoginPage(), SignOutControl(), getOperator (+8 more)

### Community 52 - "admin-auth.ts"
Cohesion: 0.17
Nodes (16): Hero(), HowItWorksCompact(), InstagramStrip(), ServiceCard(), SiteImage(), PACKAGES, BOOTH_CLOSED_WEEKDAYS, BOOTH_MEDIA (+8 more)

### Community 55 - "admin/actions.ts"
Cohesion: 0.27
Nodes (7): Button(), buttonVariants, Calendar(), CalendarDayButton(), Input(), Label(), Textarea()

### Community 56 - "popover.tsx"
Cohesion: 0.32
Nodes (6): AdminLayout(), metadata, AdminNav(), ITEMS, NavCounts, getNavCounts()

### Community 60 - "getTheme"
Cohesion: 0.15
Nodes (10): MusicSelector(), PriceTag(), HowItWorks(), ContinueDraft(), AR, DICTIONARIES, Dictionary, EN (+2 more)

### Community 80 - "Invitation Theme Set v2"
Cohesion: 0.40
Nodes (5): Contrast Token Contract, Coverage Not Score Selection Rule, Mid Range Android Performance Budget, Invitation Theme Set v2, Eight Music Files In public music

### Community 91 - "packages.ts"
Cohesion: 0.29
Nodes (8): PaymentPanel(), useIsDesktop(), BY_ID, getPackage(), isValidPackage(), PackageDefinition, buildPaymentLink(), buildPaymentMessage()

### Community 92 - "utils.ts"
Cohesion: 0.20
Nodes (9): CONTAINER_VARIANTS, FLAP_BOTTOM_VARIANTS, FLAP_LEFT_VARIANTS, FLAP_RIGHT_VARIANTS, FLAP_TOP_VARIANTS, SEAL_LEFT_VARIANTS, SEAL_RIGHT_VARIANTS, WHOLE_SEAL_VARIANTS (+1 more)

### Community 99 - "(site)/layout.tsx"
Cohesion: 0.43
Nodes (3): DirectionProvider(), SyncDocumentLang(), Toaster()

### Community 100 - "CopyValue.tsx"
Cohesion: 0.18
Nodes (9): CopyValue(), PRESETS, RejectReasonField(), CopyField(), copyText(), HungBlock(), MosqueLamp(), PLUMB_LENGTHS (+1 more)

### Community 102 - "useAutosave.ts"
Cohesion: 0.18
Nodes (10): BrandLogo(), FlowHeader(), HomeHeader(), NotAvailable(), LanguageToggle(), Progress(), post(), SaveResult (+2 more)

### Community 103 - "calendar.tsx"
Cohesion: 0.18
Nodes (11): AdminReviewsPage(), LABELS, setStatus(), STYLES, ArmedButton(), ConfirmSubmit(), SIZES, SubmitButton() (+3 more)

## Ambiguous Edges - Review These
- `Gold Layer (#b8924b)` → `Dark Brown Layer (#3b2a20)`  [AMBIGUOUS]
  public/logo.svg · relation: shares_data_with
- `qlty_step Progress Cookie` → `Dev Server Stale Chunk 404 on Phones`  [AMBIGUOUS]
  CONTRIBUTING.md · relation: semantically_similar_to
- `Backup Scheduling Not Automated` → `expiresAt Has No Policy Yet`  [AMBIGUOUS]
  README.md · relation: semantically_similar_to

## Knowledge Gaps
- **340 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+335 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Gold Layer (#b8924b)` and `Dark Brown Layer (#3b2a20)`?**
  _Edge tagged AMBIGUOUS (relation: shares_data_with) - confidence is low._
- **What is the exact relationship between `qlty_step Progress Cookie` and `Dev Server Stale Chunk 404 on Phones`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `Backup Scheduling Not Automated` and `expiresAt Has No Policy Yet`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **Why does `cn()` connect `Card & Layout Primitives` to `Iwan Theme`, `Flow Design Sections`, `Theme Component Contract`, `Preview Dialog & Buttons`, `Date Formatting & Motion Tokens`, `Root Layout & Countdown`, `Ghouroub Theme`, `Hadiqa Theme`, `Payment Panel & Alerts`, `Invitation i18n & Mashrabiya`, `React & Toggle Primitives`, `Photo Frame & Qandeel Theme`, `Reveal & Theme Sections`, `Khayamiya Theme`, `Mashrabiya Ornaments`, `Public Invitation Page`, `Accordion Primitive`, `Autosave Hook`, `admin-auth.ts`, `admin/actions.ts`, `popover.tsx`, `getTheme`, `CopyValue.tsx`, `useAutosave.ts`, `calendar.tsx`?**
  _High betweenness centrality (0.212) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Styling Utility Dependencies` to `Build Tooling Dependencies`, `Popover Primitive`, `Public Invitation Page`, `Framer Motion Dependency`, `heic2any Dependency`, `Lucide Icons Dependency`, `Radix UI Root Dependency`, `Radix Accordion Dependency`, `Radix Dialog Dependency`, `Radix Label Dependency`, `Radix Popover Dependency`, `Radix Progress Dependency`, `Radix Radio Group Dependency`, `Radix Scroll Area Dependency`, `Radix Separator Dependency`, `Radix Slot Dependency`, `Radix Toggle Dependency`, `Radix Toggle Group Dependency`, `React Day Picker Dependency`, `React DOM Dependency`, `Sonner Toast Dependency`, `tailwind-merge Dependency`, `Zod Dependency`, `firebase-admin`, `badge.tsx`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `react` connect `Public Invitation Page` to `Styling Utility Dependencies`, `admin/actions.ts`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _340 weakly-connected nodes found - possible documentation gaps or missing edges._