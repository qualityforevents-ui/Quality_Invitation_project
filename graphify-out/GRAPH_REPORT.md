# Graph Report - qlty-invitation  (2026-09-11)

## Corpus Check
- 195 files · ~154,244 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1162 nodes · 2879 edges · 96 communities (59 shown, 37 thin omitted)
- Extraction: 98% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 42 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ba404b55`
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
- Clipboard Copy Field
- format.ts
- Next.js Proxy Config
- Agent Instruction Files
- admin/actions.ts
- Firebase Admin Dependency
- Framer Motion Dependency
- heic2any Dependency
- Lucide Icons Dependency
- Next.js Dependency
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
- Light Ground Ladder
- Reduced Motion Contract
- ImageKit Setup
- Sample OG Content Type
- Sample OG Image Size
- Invitation OG Content Type
- Invitation OG Image Size
- select.tsx
- dirFor
- getTheme
- admin/layout.tsx
- CopyField.tsx
- date-fns
- react

## God Nodes (most connected - your core abstractions)
1. `cn()` - 187 edges
2. `InvitationView` - 38 edges
3. `InvitationCopy` - 30 edges
4. `Lang` - 30 edges
5. `formatEventDateParts()` - 26 edges
6. `formatEventTimeParts()` - 26 edges
7. `getTheme()` - 24 edges
8. `formatEventDate()` - 23 edges
9. `Button()` - 19 edges
10. `EASE_OUT` - 18 edges

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

## Communities (96 total, 37 thin omitted)

### Community 0 - "Firebase Auth & Data Layer"
Cohesion: 0.06
Nodes (71): BACKUP_DIR, main(), stamp(), main(), clientKey(), LoginState, signIn(), GET() (+63 more)

### Community 1 - "Preview & Sample Pages"
Cohesion: 0.09
Nodes (22): between(), ConfettiBurst(), makeParticle(), Particle, pick(), classic, ConfettiRecipe, ConfettiShape (+14 more)

### Community 2 - "Admin Pages & Chrome"
Cohesion: 0.13
Nodes (21): AllInvitationsPage(), FILTERS, Props, DraftsPage(), AdminHeader(), EmptyState(), InvitationRow(), SectionHeading() (+13 more)

### Community 3 - "Admin Actions & API Routes"
Cohesion: 0.14
Nodes (23): POST(), DIGRAPHS, REVERSE_DICTIONARY, SINGLES, suggestArabicName(), suggestLatinName(), transliterateWord(), hasArabicLetters() (+15 more)

### Community 4 - "Iwan Theme"
Cohesion: 0.07
Nodes (37): BAR, INSCRIPTION, IwanCover(), leafVariants(), LEAVES, PORTAL, Course(), Tier (+29 more)

### Community 5 - "Music & Photo Upload"
Cohesion: 0.11
Nodes (29): MusicSelector(), PhotoCropper(), Transform, ERROR_KEYS, PhotoUpload(), Stage, viewFromValues(), getEventInstant() (+21 more)

### Community 6 - "Font Registry"
Cohesion: 0.05
Nodes (42): alegreyaSans, alexandria, alice, almarai, amiri, amiriQuran, archivo, arefRuqaa (+34 more)

### Community 7 - "Card & Layout Primitives"
Cohesion: 0.11
Nodes (22): AnsweredRow(), FlowHeader(), ArrowButton(), Rule(), Corner(), Card(), CardAction(), CardContent() (+14 more)

### Community 8 - "Build Tooling Dependencies"
Cohesion: 0.06
Nodes (33): dotenv, devDependencies, dotenv, postcss, tailwindcss, @tailwindcss/postcss, tsx, tw-animate-css (+25 more)

### Community 9 - "Flow Design Sections"
Cohesion: 0.12
Nodes (24): LanguageSection(), MusicSection(), PhotoSection(), PreviewSection(), ThemeSection(), Action, FlowState, BriefSection() (+16 more)

### Community 10 - "Theme Component Contract"
Cohesion: 0.29
Nodes (9): CONTAINER_VARIANTS, NetigaCover(), TEAR_LEAF_VARIANTS_LTR, TEAR_LEAF_VARIANTS_RTL, NetigaCountdown(), NetigaInvitation(), CalendarHeaderBand(), formatNetigaDigits() (+1 more)

### Community 11 - "TypeScript Configuration"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 12 - "Preview Dialog & Buttons"
Cohesion: 0.11
Nodes (20): metadata, SamplePage(), startOver(), BrandLogo(), PreviewDialog(), StartOverButton(), BackLink(), Button() (+12 more)

### Community 13 - "Date Formatting & Motion Tokens"
Cohesion: 0.10
Nodes (28): formatEventDate(), DURATION, EASE_DRAWER, EASE_IN_OUT, EASE_OUT, INVITATION, PANEL_ENTRANCE, SECONDS (+20 more)

### Community 14 - "Landing Page & Session"
Cohesion: 0.12
Nodes (28): InvitationFlow(), reducer(), MapSection(), isSectionActive(), isSkippable(), isValidSectionId(), nextSection(), progressPercent() (+20 more)

### Community 15 - "Header, Reviews & Inputs"
Cohesion: 0.18
Nodes (11): HowItWorks(), ReviewForm(), Reviews(), Input(), Label(), Textarea(), AR, DICTIONARIES (+3 more)

### Community 16 - "Root Layout & Countdown"
Cohesion: 0.12
Nodes (15): metadata, viewport, SITE_URL, CONTAINER_VARIANTS, FLAP_BOTTOM_VARIANTS, FLAP_LEFT_VARIANTS, FLAP_RIGHT_VARIANTS, FLAP_TOP_VARIANTS (+7 more)

### Community 17 - "Ghouroub Theme"
Cohesion: 0.13
Nodes (17): BUTTON, CONTENT, GROUND, HAZE, SKY, SUN, GAP_TRAVEL, GhouroubInvitation() (+9 more)

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
Nodes (8): AccordionContent(), AccordionItem(), AccordionTrigger(), Badge(), badgeVariants, Progress(), Separator(), Skeleton()

### Community 22 - "Invitation i18n & Mashrabiya"
Cohesion: 0.19
Nodes (11): Countdown(), Parts, partsUntil(), PhotoShape, SHAPES, InvitationView, BAND_VARIANTS, CONTAINER_VARIANTS (+3 more)

### Community 23 - "Verified & Unverified Gaps"
Cohesion: 0.16
Nodes (14): Working On This Together (Contributor Guide), Arabic Diacritic Ranges Must Use \u Escapes, Arabic Fonts Subset by Unicode Range, Backup Scheduling Not Automated, Never Force Direction on Text Containing Arabic, Fourteen Stage Build Order, expiresAt Has No Policy Yet, Monogram Seal (+6 more)

### Community 24 - "React & Toggle Primitives"
Cohesion: 0.43
Nodes (5): ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 25 - "Photo Frame & Qandeel Theme"
Cohesion: 0.18
Nodes (13): AR, COPY, EN, EventCopy, InvitationCopy, CONTAINER_VARIANTS, LAMP_FAR_VARIANTS, LAMP_MID_VARIANTS (+5 more)

### Community 26 - "Reveal & Theme Sections"
Cohesion: 0.41
Nodes (10): PhotoFrame(), Reveal(), CountdownBlock(), DateBlock(), FooterBlock(), MessageBlock(), NamesBlock(), RolesBlock() (+2 more)

### Community 27 - "Typography & Verse Rules"
Cohesion: 0.13
Nodes (17): Amiri Quran As The Verse Face Only, Classic Legacy Theme, Contrast Token Contract, Coverage Not Score Selection Rule, Mid Range Android Performance Budget, Invitation Theme Set v2, Type Register Spread, Quranic Text Never Sits On A Pattern (+9 more)

### Community 28 - "Firestore Ops & Access"
Cohesion: 0.18
Nodes (13): Who Can Reach What, .env Secrets Handling, Firestore Emulator for Local Development, Single Operator Account, Public Signup Disabled, Test Invitations Pile Up in the Admin List, In-Memory Admin Query Filtering, admin.qlty.events Subdomain Routing, Firestore as the Datastore (+5 more)

### Community 29 - "Monogram & Classic Ornaments"
Cohesion: 0.40
Nodes (6): Monogram(), Divider(), OrnateFrame(), PaperTexture(), Pip(), initialOf()

### Community 30 - "Select Primitive"
Cohesion: 0.13
Nodes (15): EVENTS, PITCHES, SizeId, SIZES, SWATCH_KEYS, ThemePreviewPage(), VERSE_OPTIONS, EventType (+7 more)

### Community 31 - "Khayamiya Theme"
Cohesion: 0.17
Nodes (14): useCountdownParts(), CONTAINER_VARIANTS, KhayamiyaCover(), LEFT_FLAP_VARIANTS, RIGHT_FLAP_VARIANTS, KhayamiyaCountdown(), EightPetalMedallion(), LotusPalmette() (+6 more)

### Community 32 - "Logo Wordmark Artwork"
Cohesion: 0.42
Nodes (10): qlty Brand Palette (Gold, Cream, Warm Grey, Dark Brown), Cream Layer (#faf5ef), Dark Brown Layer (#3b2a20), .events Badge Plate, Gold Layer (#b8924b), qlty.events Brand Lockup, Rounded-Square q Mark (App-Icon Tile), Traced-Vector Lockup (No Embedded Fonts or Rasters) (+2 more)

### Community 33 - "One-Page Flow Decisions"
Cohesion: 0.24
Nodes (10): Audio Requires a Synchronous Tap, Music Library Empty, Audio Unproven, Date and Time Start Empty, Legacy /build Route Redirects, The One Page Flow, Preview Dialog Mounted on the Unopened Cover, qlty.events Digital Invitations, shadcn/ui Token Slots Pointed at Brand Values (+2 more)

### Community 34 - "Flow Reducer & Validation"
Cohesion: 0.15
Nodes (14): LoginForm(), AdminLoginPage(), AdminReviewsPage(), LABELS, setStatus(), STYLES, ConfirmSubmit(), SIZES (+6 more)

### Community 35 - "Zarf Theme"
Cohesion: 0.23
Nodes (16): CardReviewPage(), metadata, EVENT_TYPES, metadata, PreviewFramePage(), CoverStage(), ThemePicker(), MiniInvitation() (+8 more)

### Community 36 - "Firebase Setup & Backups"
Cohesion: 0.25
Nodes (9): Backup Runbook, Composite Indexes And Rules Deploy, Firebase Project Provisioning, Local Firestore Emulator, Firestore eur3 Location Choice, Deny Everything Firestore Rules, Service Account Credentials, Vercel Functions Pinned To fra1 (+1 more)

### Community 37 - "Popover Primitive"
Cohesion: 0.25
Nodes (4): PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle()

### Community 38 - "Package Catalog"
Cohesion: 0.18
Nodes (15): PaymentPanel(), useIsDesktop(), PendingBanner(), Alert(), AlertDescription(), AlertTitle(), alertVariants, BY_ID (+7 more)

### Community 39 - "Mashrabiya Ornaments"
Cohesion: 0.29
Nodes (7): Bobbin(), BobbinDivider(), GRILLE_CELLS, HexagonalVoid(), hexagonPoints(), SixLobedRosette(), TurnedGrille()

### Community 40 - "Styling Utility Dependencies"
Cohesion: 0.29
Nodes (7): class-variance-authority, next, dependencies, class-variance-authority, next, @radix-ui/react-select, @radix-ui/react-select

### Community 41 - "Theme Selection Rationale"
Cohesion: 0.18
Nodes (6): SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle()

### Community 42 - "App Icon Artwork"
Cohesion: 0.43
Nodes (7): Warm Gold-Cream-Espresso Brand Palette, Cream Glyph Path (#faf5ef), Dark Brown Detail Path (#3b2a20), Gold Badge Path (#b8924b), Next.js app/icon.svg File Convention, qlty.events Brand Mark (app icon), Hand-Traced Vector Provenance

### Community 43 - "Workflow & Phone Testing"
Cohesion: 0.40
Nodes (6): Branch and Pull Request Workflow, Dev Server Stale Chunk 404 on Phones, Phone Testing Against a Production Build, clampFurthest, Nothing Verified on a Physical Phone, qlty_step Progress Cookie

### Community 44 - "Public Invitation Page"
Cohesion: 0.47
Nodes (4): generateMetadata(), InvitationPage(), loadActiveInvitation(), Params

### Community 45 - "Firestore Schemaless Contract"
Cohesion: 0.60
Nodes (5): Firestore Has No Migrations, src/lib/types.ts Is Hand Written, InvitationRecord Document Shape, toPatch All-or-Nothing Rule, Hand Written Data Model (src/lib/types.ts)

### Community 46 - "Accordion Primitive"
Cohesion: 0.26
Nodes (11): SampleOgImage(), InvitationOgImage(), FONT_DIR, LoadedFont, loadFonts(), OG_SIZE, OgInput, renderOgImage() (+3 more)

### Community 47 - "Autosave Hook"
Cohesion: 0.18
Nodes (11): LanguageToggle(), SAMPLE_QUOTES, Invitation, Lang, Review, ReviewStatus, Status, post() (+3 more)

### Community 48 - "Vercel Region Config"
Cohesion: 0.50
Nodes (3): fra1, regions, $schema

### Community 50 - "Brand Logo & Not Available"
Cohesion: 0.19
Nodes (9): ApprovalPage(), FIELD_LABELS, Props, StatusPill(), CopyValue(), PRESETS, RejectReasonField(), editUrl() (+1 more)

### Community 52 - "format.ts"
Cohesion: 0.29
Nodes (12): formatEventDateParts(), formatEventTime(), formatEventTimeParts(), formatEventWeekday(), locale(), ClassicInvitation(), IwanInvitation(), KhayamiyaInvitation() (+4 more)

### Community 55 - "admin/actions.ts"
Cohesion: 0.55
Nodes (10): activateInvitation(), changeSlug(), deactivateInvitation(), extendExpiry(), rejectInvitation(), revalidateInvitation(), assertOperator(), getById() (+2 more)

### Community 60 - "Next.js Dependency"
Cohesion: 0.35
Nodes (8): AdminHome(), Props, AdminStats, getPending(), getStats(), isStale(), monthStart(), search()

### Community 89 - "select.tsx"
Cohesion: 0.18
Nodes (7): SelectContent(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator(), SelectTrigger()

### Community 90 - "dirFor"
Cohesion: 0.40
Nodes (6): SiteLayout(), DirectionProvider(), SyncDocumentLang(), Toaster(), dirFor(), htmlLangFor()

### Community 91 - "getTheme"
Cohesion: 0.36
Nodes (6): InvitationExperience(), InvitationShell(), MuteToggle(), InvitationAudio, useInvitationAudio(), getTheme()

### Community 92 - "admin/layout.tsx"
Cohesion: 0.32
Nodes (6): AdminLayout(), metadata, AdminNav(), ITEMS, NavCounts, getNavCounts()

## Ambiguous Edges - Review These
- `Gold Layer (#b8924b)` → `Dark Brown Layer (#3b2a20)`  [AMBIGUOUS]
  public/logo.svg · relation: shares_data_with
- `qlty_step Progress Cookie` → `Dev Server Stale Chunk 404 on Phones`  [AMBIGUOUS]
  CONTRIBUTING.md · relation: semantically_similar_to
- `Backup Scheduling Not Automated` → `expiresAt Has No Policy Yet`  [AMBIGUOUS]
  README.md · relation: semantically_similar_to

## Knowledge Gaps
- **299 isolated node(s):** `name`, `version`, `private`, `dev`, `build` (+294 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Gold Layer (#b8924b)` and `Dark Brown Layer (#3b2a20)`?**
  _Edge tagged AMBIGUOUS (relation: shares_data_with) - confidence is low._
- **What is the exact relationship between `qlty_step Progress Cookie` and `Dev Server Stale Chunk 404 on Phones`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `Backup Scheduling Not Automated` and `expiresAt Has No Policy Yet`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **Why does `cn()` connect `Card & Layout Primitives` to `Admin Pages & Chrome`, `Iwan Theme`, `Music & Photo Upload`, `Flow Design Sections`, `Theme Component Contract`, `Preview Dialog & Buttons`, `Date Formatting & Motion Tokens`, `Header, Reviews & Inputs`, `Root Layout & Countdown`, `Ghouroub Theme`, `Hadiqa Theme`, `Payment Panel & Alerts`, `Invitation i18n & Mashrabiya`, `React & Toggle Primitives`, `Photo Frame & Qandeel Theme`, `Reveal & Theme Sections`, `Monogram & Classic Ornaments`, `Khayamiya Theme`, `Zarf Theme`, `Popover Primitive`, `Package Catalog`, `Mashrabiya Ornaments`, `Theme Selection Rationale`, `Autosave Hook`, `format.ts`, `select.tsx`, `CopyField.tsx`?**
  _High betweenness centrality (0.216) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Styling Utility Dependencies` to `Build Tooling Dependencies`, `Clipboard Copy Field`, `Firebase Admin Dependency`, `Framer Motion Dependency`, `heic2any Dependency`, `Lucide Icons Dependency`, `Radix UI Root Dependency`, `Radix Accordion Dependency`, `Radix Dialog Dependency`, `Radix Label Dependency`, `Radix Popover Dependency`, `Radix Progress Dependency`, `Radix Radio Group Dependency`, `Radix Scroll Area Dependency`, `Radix Separator Dependency`, `Radix Slot Dependency`, `Radix Toggle Dependency`, `Radix Toggle Group Dependency`, `React Day Picker Dependency`, `React DOM Dependency`, `Sonner Toast Dependency`, `tailwind-merge Dependency`, `Zod Dependency`, `date-fns`, `react`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `Styling Utility Dependencies`, `React & Toggle Primitives`, `Preview Dialog & Buttons`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _299 weakly-connected nodes found - possible documentation gaps or missing edges._