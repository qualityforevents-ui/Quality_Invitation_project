# Graph Report - qlty-invitation  (2026-09-17)

## Corpus Check
- 259 files · ~216,125 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1573 nodes · 4406 edges · 102 communities (76 shown, 26 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0e48fa6e`
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
- Invitation Theme Set v2
- BoothFaq.tsx
- Radix Label Dependency
- (site)/layout.tsx
- Radix Progress Dependency
- Radix Radio Group Dependency
- Radix Scroll Area Dependency
- class-variance-authority
- Radix Slot Dependency
- ActionButton.tsx
- Radix Toggle Group Dependency
- React Day Picker Dependency
- (site)/layout.tsx
- Sonner Toast Dependency
- heic2any
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
- class-variance-authority
- AvailabilityCalendar.tsx
- SiteFooter.tsx
- toggle-group.tsx
- Invitation Theme Set v2
- ReviewForm.tsx
- events.test.ts
- FlowHeader.tsx
- @radix-ui/react-dialog
- @radix-ui/react-scroll-area

## God Nodes (most connected - your core abstractions)
1. `cn()` - 222 edges
2. `InvitationView` - 38 edges
3. `Lang` - 38 edges
4. `boothReservations()` - 34 edges
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

## Communities (102 total, 26 thin omitted)

### Community 0 - "Firebase Auth & Data Layer"
Cohesion: 0.09
Nodes (25): ArrowButton(), ThemePicker(), between(), ConfettiBurst(), makeParticle(), Particle, pick(), classic (+17 more)

### Community 1 - "Preview & Sample Pages"
Cohesion: 0.20
Nodes (23): SiteLayout(), CardReviewPage(), metadata, EVENT_TYPES, metadata, PreviewFramePage(), CoverStage(), InvitationExperience() (+15 more)

### Community 2 - "Admin Pages & Chrome"
Cohesion: 0.12
Nodes (37): toDate(), toDateOr(), addDays(), daysBetween(), dayStatus, DayStatusInput, EMPTY_OCCUPANCY, isBookable() (+29 more)

### Community 3 - "Admin Actions & API Routes"
Cohesion: 0.14
Nodes (23): POST(), DIGRAPHS, REVERSE_DICTIONARY, SINGLES, suggestArabicName(), suggestLatinName(), transliterateWord(), hasArabicLetters() (+15 more)

### Community 4 - "Iwan Theme"
Cohesion: 0.07
Nodes (36): BAR, INSCRIPTION, IwanCover(), leafVariants(), LEAVES, PORTAL, Tier, AblaqCourses() (+28 more)

### Community 5 - "Music & Photo Upload"
Cohesion: 0.07
Nodes (49): POST(), AvailabilityCalendar(), dateKey(), DayMap, LegendItem(), monthKey(), toLocalDate(), BoothViewedBeacon() (+41 more)

### Community 6 - "Font Registry"
Cohesion: 0.05
Nodes (42): alegreyaSans, alexandria, alice, almarai, amiri, amiriQuran, archivo, arefRuqaa (+34 more)

### Community 7 - "Card & Layout Primitives"
Cohesion: 0.06
Nodes (38): Corner(), Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle() (+30 more)

### Community 8 - "Build Tooling Dependencies"
Cohesion: 0.10
Nodes (21): dotenv, devDependencies, dotenv, postcss, tailwindcss, @tailwindcss/postcss, tsx, tw-animate-css (+13 more)

### Community 9 - "Flow Design Sections"
Cohesion: 0.15
Nodes (19): BoothSettingsPage(), syncNow(), WEEKDAYS, authorised(), GET(), GET(), QuerySchema, readAvailability (+11 more)

### Community 10 - "Theme Component Contract"
Cohesion: 0.16
Nodes (8): metadata, viewport, SiteFooter(), SupportButton(), SITE_URL, whatsappLink(), config, proxy()

### Community 11 - "TypeScript Configuration"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 12 - "Preview Dialog & Buttons"
Cohesion: 0.14
Nodes (17): metadata, startOver(), PreviewDialog(), StartOverButton(), BackLink(), Button(), buttonVariants, Calendar() (+9 more)

### Community 13 - "Date Formatting & Motion Tokens"
Cohesion: 0.15
Nodes (24): formatNotionPrice(), formatNotionTime(), fromNotionPage(), NotionBooking, pad(), ParsedTime, parseNotionPrice(), parseNotionTime() (+16 more)

### Community 14 - "Landing Page & Session"
Cohesion: 0.15
Nodes (20): GET(), POST(), CONTENT_FIELDS, hasContent(), POST(), GET(), GET(), createUploadAuth() (+12 more)

### Community 15 - "Header, Reviews & Inputs"
Cohesion: 0.12
Nodes (31): main(), HANDLED, POST(), WebhookBody, boothReservationHistory(), hashReservation(), boothDataSourceId(), createPage() (+23 more)

### Community 16 - "Root Layout & Countdown"
Cohesion: 0.19
Nodes (11): useCountdownParts(), KhayamiyaCountdown(), MashrabiyaCountdown(), QandeelCountdown(), BAND_VARIANTS, CONTAINER_VARIANTS, RizmaCover(), RizmaCountdown() (+3 more)

### Community 17 - "Ghouroub Theme"
Cohesion: 0.13
Nodes (17): BUTTON, CONTENT, GROUND, HAZE, SKY, SUN, GAP_TRAVEL, GhouroubInvitation() (+9 more)

### Community 18 - "Hadiqa Theme"
Cohesion: 0.11
Nodes (19): CONTENT, HadiqaCover(), petalVariants(), STEM, Block(), HadiqaInvitation(), useReducedMotion(), BUD_ANGLES (+11 more)

### Community 19 - "Theme Catalog v2"
Cohesion: 0.13
Nodes (21): Considered And Dropped Concepts, Three Built Then Cut Themes, Floral Legacy Theme, Ghouroub Theme, Hadiqa Theme, Iwan Theme, Khayamiya Theme, Lawh Theme (+13 more)

### Community 20 - "shadcn Component Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 21 - "Payment Panel & Alerts"
Cohesion: 0.32
Nodes (6): AdminLayout(), metadata, AdminNav(), ITEMS, NavCounts, getNavCounts()

### Community 22 - "Invitation i18n & Mashrabiya"
Cohesion: 0.15
Nodes (24): activateInvitation(), changeSlug(), deactivateInvitation(), extendExpiry(), rejectInvitation(), revalidateInvitation(), ApprovalPage(), FIELD_LABELS (+16 more)

### Community 23 - "Verified & Unverified Gaps"
Cohesion: 0.16
Nodes (14): Working On This Together (Contributor Guide), Arabic Diacritic Ranges Must Use \u Escapes, Arabic Fonts Subset by Unicode Range, Backup Scheduling Not Automated, Never Force Direction on Text Containing Arabic, Fourteen Stage Build Order, expiresAt Has No Policy Yet, Monogram Seal (+6 more)

### Community 24 - "React & Toggle Primitives"
Cohesion: 0.17
Nodes (12): CONTAINER_VARIANTS, FLAP_BOTTOM_VARIANTS, FLAP_LEFT_VARIANTS, FLAP_RIGHT_VARIANTS, FLAP_TOP_VARIANTS, SEAL_LEFT_VARIANTS, SEAL_RIGHT_VARIANTS, WHOLE_SEAL_VARIANTS (+4 more)

### Community 25 - "Photo Frame & Qandeel Theme"
Cohesion: 0.11
Nodes (24): AnsweredRow(), Action, FlowState, BriefSection(), COMMON_TIMES, DateSection(), MapSection(), MessageSection() (+16 more)

### Community 26 - "Reveal & Theme Sections"
Cohesion: 0.19
Nodes (14): Countdown(), Parts, partsUntil(), Monogram(), Divider(), OrnateFrame(), PaperTexture(), Pip() (+6 more)

### Community 27 - "Typography & Verse Rules"
Cohesion: 0.13
Nodes (17): Amiri Quran As The Verse Face Only, Classic Legacy Theme, Contrast Token Contract, Coverage Not Score Selection Rule, Mid Range Android Performance Budget, Invitation Theme Set v2, Type Register Spread, Quranic Text Never Sits On A Pattern (+9 more)

### Community 28 - "Firestore Ops & Access"
Cohesion: 0.18
Nodes (13): Who Can Reach What, .env Secrets Handling, Firestore Emulator for Local Development, Single Operator Account, Public Signup Disabled, Test Invitations Pile Up in the Admin List, In-Memory Admin Query Filtering, admin.qlty.events Subdomain Routing, Firestore as the Datastore (+5 more)

### Community 29 - "Monogram & Classic Ornaments"
Cohesion: 0.19
Nodes (14): SamplePage(), generateMetadata(), InvitationsPage(), generateMetadata(), generateMetadata(), HowItWorks(), getDictionary(), loadDraft() (+6 more)

### Community 30 - "Select Primitive"
Cohesion: 0.17
Nodes (11): 1. Prices and packages, 2. How many jobs you can run in a day, 3. The deposit, 4. Notice and horizon, 5. Areas and travel, 6. Photographs and video, 7. The Instagram handle, 8. The booth phone number (+3 more)

### Community 31 - "Khayamiya Theme"
Cohesion: 0.17
Nodes (11): 0. Before any of this, 1. The domain — Rashad only, 2. Environment variables — Rashad only, 3. Firebase — Rashad only, 4. Meta — Rashad only, 5. Notion, 6. The scheduled sync, 7. Backups — Rashad only (+3 more)

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
Cohesion: 0.16
Nodes (22): formatEventDate(), formatEventDateParts(), formatEventTimeParts(), formatEventWeekday(), locale(), ClassicCover(), ClassicInvitation(), CardComponent (+14 more)

### Community 36 - "Firebase Setup & Backups"
Cohesion: 0.25
Nodes (9): Backup Runbook, Composite Indexes And Rules Deploy, Firebase Project Provisioning, Local Firestore Emulator, Firestore eur3 Location Choice, Deny Everything Firestore Rules, Service Account Credentials, Vercel Functions Pinned To fra1 (+1 more)

### Community 37 - "Popover Primitive"
Cohesion: 0.15
Nodes (22): AllInvitationsPage(), FILTERS, Props, DraftsPage(), AdminHome(), Props, EmptyState(), InvitationRow() (+14 more)

### Community 38 - "Package Catalog"
Cohesion: 0.30
Nodes (13): PhotoFrame(), PhotoShape, SHAPES, Reveal(), InvitationView, CountdownBlock(), DateBlock(), FooterBlock() (+5 more)

### Community 39 - "Mashrabiya Ornaments"
Cohesion: 0.29
Nodes (9): SampleOgImage(), InvitationOgImage(), FONT_DIR, LoadedFont, loadFonts(), OG_SIZE, OgInput, renderOgImage() (+1 more)

### Community 40 - "Styling Utility Dependencies"
Cohesion: 0.09
Nodes (23): class-variance-authority, clsx, date-fns, framer-motion, next, dependencies, class-variance-authority, clsx (+15 more)

### Community 41 - "Theme Selection Rationale"
Cohesion: 0.18
Nodes (12): BoothGallery(), InstagramStrip(), SiteImage(), BOOTH_AREAS, BoothArea, BoothPackageDefinition, getBoothArea(), INSTAGRAM_TILES (+4 more)

### Community 42 - "App Icon Artwork"
Cohesion: 0.43
Nodes (7): Warm Gold-Cream-Espresso Brand Palette, Cream Glyph Path (#faf5ef), Dark Brown Detail Path (#3b2a20), Gold Badge Path (#b8924b), Next.js app/icon.svg File Convention, qlty.events Brand Mark (app icon), Hand-Traced Vector Provenance

### Community 43 - "Workflow & Phone Testing"
Cohesion: 0.40
Nodes (6): Branch and Pull Request Workflow, Dev Server Stale Chunk 404 on Phones, Phone Testing Against a Production Build, clampFurthest, Nothing Verified on a Physical Phone, qlty_step Progress Cookie

### Community 44 - "Public Invitation Page"
Cohesion: 0.09
Nodes (21): EVENTS, PITCHES, SizeId, SIZES, SWATCH_KEYS, VERSE_OPTIONS, BoothDay, BoothSettings (+13 more)

### Community 45 - "Firestore Schemaless Contract"
Cohesion: 0.60
Nodes (5): Firestore Has No Migrations, src/lib/types.ts Is Hand Written, InvitationRecord Document Shape, toPatch All-or-Nothing Rule, Hand Written Data Model (src/lib/types.ts)

### Community 46 - "Accordion Primitive"
Cohesion: 0.18
Nodes (14): HomePage(), BoothHero(), Hero(), HomeHeader(), HowItWorksCompact(), PriceTag(), ContinueDraft(), AR (+6 more)

### Community 47 - "Autosave Hook"
Cohesion: 0.29
Nodes (7): Bobbin(), BobbinDivider(), GRILLE_CELLS, HexagonalVoid(), hexagonPoints(), SixLobedRosette(), TurnedGrille()

### Community 48 - "Vercel Region Config"
Cohesion: 0.40
Nodes (4): fra1, crons, regions, $schema

### Community 50 - "Brand Logo & Not Available"
Cohesion: 0.16
Nodes (31): assertId(), blockDay(), cancelBooking(), changeBookingDate(), completeBooking(), confirmBooking(), createManualBooking(), editBooking() (+23 more)

### Community 51 - "login/actions.ts"
Cohesion: 0.15
Nodes (21): clientKey(), LoginState, signIn(), signOut(), LoginForm(), AdminLoginPage(), POST(), SignOutControl() (+13 more)

### Community 52 - "admin-auth.ts"
Cohesion: 0.43
Nodes (3): Input(), Label(), Textarea()

### Community 53 - "Next.js Proxy Config"
Cohesion: 0.27
Nodes (15): invitations(), applyPatch(), claimSlug(), createDraft(), desiredSlug(), findOneBy(), getByRequestId(), mapInvitation() (+7 more)

### Community 55 - "admin/actions.ts"
Cohesion: 0.22
Nodes (12): BACKUP_DIR, main(), plain(), stamp(), main(), boothDays(), boothSettingsDoc(), COLLECTIONS (+4 more)

### Community 56 - "popover.tsx"
Cohesion: 0.21
Nodes (17): MusicSelector(), viewFromValues(), getEventInstant(), zoneOffsetMs(), toInvitationView(), getTrack(), isValidTrackId(), MUSIC_TRACKS (+9 more)

### Community 57 - "Framer Motion Dependency"
Cohesion: 0.33
Nodes (7): PaymentPanel(), useIsDesktop(), PendingBanner(), Alert(), AlertDescription(), AlertTitle(), alertVariants

### Community 58 - "heic2any Dependency"
Cohesion: 0.13
Nodes (14): 1. What was added, and why, 2. How your columns map, 3. The integration token, 4. Import what is already there, 5. The webhook, 6. The scheduled catch up, How it behaves once it is running, Notion booth sync: setting it up (+6 more)

### Community 60 - "getTheme"
Cohesion: 0.09
Nodes (39): InvitationFlow(), reducer(), PhotoCropper(), Transform, ERROR_KEYS, Stage, isSectionActive(), isSkippable() (+31 more)

### Community 62 - "Radix UI Root Dependency"
Cohesion: 0.21
Nodes (19): BoothCalendarPage(), Legend(), resolveMonth(), shiftMonth(), WEEKDAYS, BoothQueuePage(), boothReservations(), todayInCairo() (+11 more)

### Community 64 - "BoothFaq.tsx"
Cohesion: 0.22
Nodes (10): PhotoBoothPage(), BoothFaq(), BoothPackages(), Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), BOOTH_BY_ID (+2 more)

### Community 66 - "(site)/layout.tsx"
Cohesion: 0.29
Nodes (9): CONTAINER_VARIANTS, NetigaCover(), TEAR_LEAF_VARIANTS_LTR, TEAR_LEAF_VARIANTS_RTL, NetigaCountdown(), NetigaInvitation(), CalendarHeaderBand(), formatNetigaDigits() (+1 more)

### Community 69 - "Radix Scroll Area Dependency"
Cohesion: 0.19
Nodes (9): BoothStatusPage(), metadata, TONE, ReviewForm(), Reviews(), formatShortDateTime(), BoothStatus, Review (+1 more)

### Community 70 - "class-variance-authority"
Cohesion: 0.31
Nodes (6): generateMetadata(), InvitationPage(), loadActiveInvitation(), Params, ViewBeacon(), Invitation

### Community 71 - "Radix Slot Dependency"
Cohesion: 0.60
Nodes (4): booking(), cleanup(), DATE, main()

### Community 72 - "ActionButton.tsx"
Cohesion: 0.13
Nodes (20): NewBoothBookingPage(), AdminReviewsPage(), LABELS, setStatus(), STYLES, ArmedButton(), ConfirmSubmit(), SIZES (+12 more)

### Community 75 - "(site)/layout.tsx"
Cohesion: 0.43
Nodes (3): DirectionProvider(), SyncDocumentLang(), Toaster()

### Community 89 - "proxy.ts"
Cohesion: 0.15
Nodes (13): DURATION, EASE_DRAWER, EASE_IN_OUT, EASE_OUT, INVITATION, PANEL_ENTRANCE, SECONDS, FloralCover() (+5 more)

### Community 91 - "packages.ts"
Cohesion: 0.15
Nodes (17): HandoffResult, handoffToWhatsApp(), requestBooking(), RequestBookingResult, BoothBooking(), NativeSelect(), Row(), Stage (+9 more)

### Community 93 - "AvailabilityCalendar.tsx"
Cohesion: 0.20
Nodes (10): scripts, backup, build, check:booth, check:music, dev, notion:import, start (+2 more)

### Community 96 - "toggle-group.tsx"
Cohesion: 0.14
Nodes (16): react, react, LanguageSection(), MusicSection(), PhotoSection(), PreviewSection(), ThemeSection(), PhotoUpload() (+8 more)

### Community 97 - "Invitation Theme Set v2"
Cohesion: 0.47
Nodes (3): CopyValue(), CopyField(), copyText()

### Community 99 - "ReviewForm.tsx"
Cohesion: 0.29
Nodes (8): CONTAINER_VARIANTS, KhayamiyaCover(), LEFT_FLAP_VARIANTS, RIGHT_FLAP_VARIANTS, EightPetalMedallion(), LotusPalmette(), RunningStitchSeam(), SteppedMerlonBorder()

### Community 100 - "events.test.ts"
Cohesion: 0.27
Nodes (8): CONTAINER_VARIANTS, LAMP_FAR_VARIANTS, LAMP_MID_VARIANTS, LAMP_NEAR_VARIANTS, QandeelCover(), MosqueLamp(), PLUMB_LENGTHS, PlumbLine()

### Community 102 - "FlowHeader.tsx"
Cohesion: 0.20
Nodes (9): BrandLogo(), FlowHeader(), NotAvailable(), LanguageToggle(), Progress(), post(), SaveResult, SaveStatus (+1 more)

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
- **391 isolated node(s):** `DATE`, `$schema`, `style`, `rsc`, `tsx` (+386 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Gold Layer (#b8924b)` and `Dark Brown Layer (#3b2a20)`?**
  _Edge tagged AMBIGUOUS (relation: shares_data_with) - confidence is low._
- **What is the exact relationship between `qlty_step Progress Cookie` and `Dev Server Stale Chunk 404 on Phones`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `Backup Scheduling Not Automated` and `expiresAt Has No Policy Yet`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **Why does `cn()` connect `Card & Layout Primitives` to `Firebase Auth & Data Layer`, `Preview & Sample Pages`, `Iwan Theme`, `Music & Photo Upload`, `Theme Component Contract`, `Preview Dialog & Buttons`, `Root Layout & Countdown`, `Ghouroub Theme`, `Hadiqa Theme`, `Payment Panel & Alerts`, `Invitation i18n & Mashrabiya`, `React & Toggle Primitives`, `Photo Frame & Qandeel Theme`, `Reveal & Theme Sections`, `Zarf Theme`, `Popover Primitive`, `Package Catalog`, `Theme Selection Rationale`, `Public Invitation Page`, `Autosave Hook`, `Brand Logo & Not Available`, `admin-auth.ts`, `popover.tsx`, `Framer Motion Dependency`, `Radix UI Root Dependency`, `BoothFaq.tsx`, `(site)/layout.tsx`, `ActionButton.tsx`, `proxy.ts`, `packages.ts`, `toggle-group.tsx`, `Invitation Theme Set v2`, `ReviewForm.tsx`, `events.test.ts`, `FlowHeader.tsx`?**
  _High betweenness centrality (0.195) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Styling Utility Dependencies` to `toggle-group.tsx`, `Radix Label Dependency`, `Radix Progress Dependency`, `Radix Radio Group Dependency`, `@radix-ui/react-dialog`, `@radix-ui/react-scroll-area`, `Radix Toggle Group Dependency`, `React Day Picker Dependency`, `Sonner Toast Dependency`, `heic2any`, `Zod Dependency`, `PaymentPanel.tsx`, `firebase-admin`, `Lucide Icons Dependency`, `class-variance-authority`, `SiteFooter.tsx`, `Invitation Theme Set v2`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Why does `react` connect `toggle-group.tsx` to `Styling Utility Dependencies`, `Preview Dialog & Buttons`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **What connects `DATE`, `$schema`, `style` to the rest of the system?**
  _391 weakly-connected nodes found - possible documentation gaps or missing edges._