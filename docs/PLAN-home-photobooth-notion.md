# Build plan: QLTY home, Photo Booth rental, Notion sync, qlty.events launch

Hand this file to Claude Code from the repo root:
"Read docs/PLAN-home-photobooth-notion.md and execute it phase by phase. Stop at the end of each phase, run the checks, and report before moving on."

## 0. Context Claude Code must respect

This repo is live code for the digital invitations product. Read these before touching anything:

1. `AGENTS.md`: this is Next 16. Read the relevant guide in `node_modules/next/dist/docs/` before writing routes, `proxy.ts`, caching or `after()`. Middleware is now `src/proxy.ts`.
2. `CLAUDE.md`: Meta pixel + Conversions API rules. Never call `fbq` directly, new event names go in `src/lib/meta/events.ts` first, once per visit guards use sessionStorage, `Purchase` is server side only, and `/[slug]` (wedding guests) is never tracked.
3. `README.md` section "Things that will bite if you forget them". Especially: no double hyphens in any customer facing text (also applies to this whole project's files and copy), theme colours through `@theme inline`, Arabic regex ranges as `\u` escapes, `numeric` utility only on bare digits.
4. Database is **Firestore via the Admin SDK only** (`src/lib/db.ts`). No client access, rules are deny all. There is no schema: `src/lib/types.ts` is the source of truth, new fields are optional on old docs.
5. Copy lives in `src/i18n/ui.ts` (Egyptian Arabic, English written on its own terms). Arabic is the default and the UI is RTL.
6. `admin.qlty.events` is rewritten onto `/admin` by `src/proxy.ts`. Auth is `requireOperator` / `assertOperator`.
7. All event dates are Cairo calendar days (`EVENT_TIMEZONE = 'Africa/Cairo'`, `todayInCairo()`). Store booth dates as `YYYY-MM-DD` strings, never as Timestamps, so a day never shifts across a timezone boundary.
8. After code changes run `graphify update .`, then `npm run typecheck` and `npm run build`.

Git hygiene before phase 1: the working tree on `main` has uncommitted changes. Ask Rashad to commit or stash them, then create a branch `feat/home-photobooth`. Two remotes exist (`origin` = qualityforevents-ui, `mine` = personal). Ask which one Vercel deploys from before pushing.

## 1. Inputs Rashad fills in before running (put them in `src/lib/photobooth/config.ts` and `.env`)

- Number of booth units owned (capacity per day).
- Booth packages: name AR/EN, price EGP, hours included, what's included (prints, backdrop, props, digital gallery, attendant), extra hour price.
- Deposit amount or percent and how it's paid (InstaPay on WhatsApp, same as invitations).
- Service areas (Cairo, Giza) and any transport fee outside them.
- Minimum notice (for example no bookings for today or tomorrow).
- Booth photos and a short video for the home and booth pages (upload to ImageKit).
- WhatsApp number for booth enquiries (can be the same as `NEXT_PUBLIC_WHATSAPP_NUMBER`).
- Notion: internal integration token, the booth reservations database shared with the integration, its data source id, webhook verification token.

Until these exist, Claude Code uses clearly marked placeholder values and lists them in the phase report.

## 2. Target site map

- `qlty.events/` : **new QLTY home**. Brand intro and two service entry points.
- `qlty.events/invitations` : the existing one page invitation builder, moved from `/` unchanged.
- `qlty.events/photobooth` : **new Photo Booth rental page** with live availability and booking request.
- `qlty.events/photobooth/request/[token]` : booking status page (like `/build/status/[editToken]`).
- `qlty.events/sample`, `/[slug]`, `/build/status/[editToken]`, `/edit/[editToken]` : unchanged.
- `admin.qlty.events` : existing admin plus a new Photo Booth section.
- `www.qlty.events` and the old `*.vercel.app` production host : 308 redirect to `https://qlty.events`.

## Phase 1: Move the builder to /invitations without breaking any old link

1. Create `src/app/(site)/invitations/page.tsx` containing the current `(site)/page.tsx` logic verbatim (still `force-dynamic`, still reads `?package=`).
2. Update internal links that mean "the builder": `redirect('/')` in `src/app/(site)/actions.ts` and `src/app/(site)/build/status/[editToken]/actions.ts`, the `FlowHeader` logo link, `BackLink` on `/sample`, `revalidatePath('/')` in `admin/reviews/page.tsx` (revalidate both `/` and `/invitations`, reviews may show on the home too). `NotAvailable` logo link stays `/` (home).
3. In `next.config.ts` point the `/build`, `/build/theme`, `/build/preview`, `/build/payment` redirects at `/invitations`.
4. Old links like `qlty.events/?package=UNLIMITED` are in WhatsApp threads and ads. In `src/proxy.ts`, when the path is exactly `/` on the main host and `package` is in the query, redirect (307) to `/invitations` keeping the query.
5. A returning customer with a draft cookie (`qlty_edit`) landing on `/` should still find their draft: show a slim "Continue your invitation" bar on the home when the cookie resolves to a draft (server read, no client DB).
6. Search the codebase and message builders (`src/lib/whatsapp.ts`, admin actions, OG images) for any URL that assumes the builder is at the root and fix it.

Check: every old URL above lands in the right place; `npm run build` passes; the builder flow works end to end at `/invitations`.

## Phase 2: QLTY home page

Design direction (from the QLTY brand work, restraint first):
- Reuse the existing site tokens (cream, ink, gold, line) and `uiFontVariables` so home, builder and booth feel like one site. Ivory `#FAF6EF`, Espresso `#3B2A20`, Deep Gold `#B8924A` are the brand references; map to the existing tokens rather than introducing a second palette.
- Clean, composed, premium. Few labels, no chips, no decorative clutter. Motion only on one or two focal elements (framer motion is installed; respect `prefers-reduced-motion`).
- The oversized slightly rotated gold price tag is the signature motif: use it once, on the booth card's "from X EGP".
- Mobile first (most traffic is Instagram and WhatsApp on phones), fully bilingual via `getDictionary`, RTL correct, `LanguageToggle` in the header.

Sections, in order:
1. Header: `BrandLogo`, language toggle, links Invitations and Photo Booth.
2. Hero: one line headline about QLTY making the moments of the event, short subline, two primary buttons: "Book a photo booth" and "Create your invitation".
3. Two service cards, each with a real photo or looping muted short video (ImageKit, lazy), a one sentence promise, starting price, CTA.
4. How it works for each service (three steps each, compact).
5. Reviews: reuse `Reviews` component and `getApprovedReviews()` (later add a `service` field to reviews, optional).
6. Instagram strip (static images linking to the Instagram profile; no embed script).
7. Footer: WhatsApp, Instagram, service area (Cairo and Giza), links.
8. Floating WhatsApp button (Phase 5).

SEO and metadata: per page `generateMetadata` in both languages, OG image for the home, `src/app/robots.ts` and `src/app/sitemap.ts` (home, invitations, photobooth, sample; never admin, edit, build, status, slugs), JSON LD `LocalBusiness` with the two services. Move the invitations only description out of the root layout into `/invitations`.

Check: Lighthouse mobile performance and accessibility at least 90, no layout shift from images, both languages reviewed on a 375px wide screen.

## Phase 3: Photo Booth data model and availability engine (Firestore)

Add to `src/lib/types.ts` and `src/lib/db.ts`:

`boothReservations/{id}`
- `id`, `bookingId` (human id like `QLB-7K3M9P`, reuse the `generateRequestId` alphabet with a `QLB` prefix), `statusToken` (random, for the customer status page, httpOnly cookie like `qlty_edit`)
- `status`: `REQUESTED` | `HELD` | `CONFIRMED` | `COMPLETED` | `CANCELLED` | `BLOCKED` (BLOCKED = manual unavailability, no customer)
- `eventDate` (`YYYY-MM-DD`), `startTime`, `hours`, `units` (default 1)
- `packageId`, `price`, `extras`, `depositAmount`, `depositPaid` (bool)
- `customerName`, `customerPhone` (Egyptian local form, same validation as invitations), `venue`, `area`, `eventType`, `notes`, `lang`
- `source`: `site` | `admin` | `notion`
- `holdExpiresAt` (for `HELD`)
- `metaAttribution` (same shape as invitations: fbp, fbc, ip, ua, source url) for the later server side Purchase
- Notion sync fields: `notionPageId`, `notionLastEditedTime`, `lastSyncedAt`, `syncHash` (hash of the synced fields), `syncState`: `ok` | `pending` | `error`, `syncError`
- `createdAt`, `updatedAt`

`boothDays/{YYYY-MM-DD}` : the concurrency lock and counter
- `unitsConfirmed`, `unitsHeld`, `unitsBlocked`, `reservationIds`, `updatedAt`

`boothSettings/main`
- `unitCount`, `minNoticeDays`, `maxAdvanceDays`, `holdHours` (how long a request that went to WhatsApp holds a unit, suggest 24), `closedWeekdays`, `blackoutDates`

`syncState/notionBooth`
- `lastIncrementalCursor` (Notion `last_edited_time`), `lastFullReconcileAt`, `lastWebhookAt`, `lastError`

Rules (put them in `src/lib/photobooth/availability.ts` with unit tests):
- Occupied units for a day = `unitsConfirmed + unitsHeld (not expired) + unitsBlocked`.
- A day is `available` if occupied < unitCount, `last` if exactly one unit left, `full` otherwise. Past days, days inside `minNoticeDays`, closed weekdays and blackout dates are `unavailable`.
- `REQUESTED` does not occupy a unit. When the customer taps through to WhatsApp the request becomes `HELD` for `holdHours`. Admin confirming turns it `CONFIRMED`. Expired holds are released lazily on read and by the sync job.
- **Every status or date change runs in a Firestore transaction that reads and rewrites the `boothDays` doc**, so two customers cannot take the last unit at the same moment. If the day became full between page load and submit, return a clear "this date was just taken" error with the next three available dates.
- Admin and Notion edits may overbook (a human decided). The day then carries `overbooked: true` and the admin shows a red warning.

Public API (all rate limited with `checkRateLimit`, zod validated, honeypot field on the form):
- `GET /api/photobooth/availability?from=YYYY-MM&months=3` returns `{ date: status }` only. No names, phones or counts beyond "last unit". Cache for 60 seconds with revalidation tagged `booth-availability`, revalidated on every write.
- Server action `requestBooking` creates `REQUESTED`, sets status cookie, returns WhatsApp link payload.
- Server action `handoffToWhatsApp(bookingId)` moves to `HELD` inside the transaction.

## Phase 4: Photo Booth page `/photobooth`

Inside the `(site)` group so it inherits the pixel and fonts.

1. Hero: one strong photo or looping clip, headline, "from X EGP" gold tag, "Check availability" button that scrolls to the calendar.
2. What you get: packages from `config.ts` as cards (tap to select, `?package=` in URL so ads can deep link).
3. Gallery: 6 to 9 real booth shots (ImageKit transforms, `next/image`).
4. Availability calendar: `react-day-picker` (already installed, `src/components/ui/calendar.tsx`) showing available, last unit, full, unavailable, with a legend. Month navigation fetches the availability API. RTL aware.
5. Booking form (one page, reveals progressively like the invitation flow): date (from calendar), package, start time and hours, venue and area, name, phone, event type, notes. Autosave not needed.
6. Submit shows a summary card with the booking id, price, deposit, and one button: "Confirm on WhatsApp". The prefilled message (new `buildBoothBookingMessage` in `src/lib/whatsapp.ts`, AR and EN like `buildPaymentMessage`) carries booking id, date, package, venue, amount and the deposit instruction.
7. Status page `/photobooth/request/[token]`: shows state (waiting for deposit, confirmed, cancelled) and hold expiry, with WhatsApp support carrying the booking id. `noindex` header added in `next.config.ts`.
8. FAQ accordion (space needed, power, setup time, delivery of photos, cancellation).

All copy added to `src/i18n/ui.ts` under a `photobooth` key in both languages.

## Phase 5: Floating WhatsApp support everywhere it belongs

1. Keep `SupportButton` (physical right, clears bottom bars with `raised`). Wrap it in a small client component `TrackedSupportButton` that calls `metaTrack('Contact', { content_category, page })` on click before navigation (do not block the link).
2. Context aware prefilled message:
   - home: general enquiry
   - `/invitations`: existing `t.landing.supportMessage`, with request id when a draft exists
   - `/photobooth`: booth enquiry, including the selected date and package if chosen
   - booth status page: includes booking id
3. Optional `NEXT_PUBLIC_WHATSAPP_BOOTH_NUMBER`, falling back to the main number.
4. Never render it on `/[slug]`, the invitation preview, or admin. Make sure `Toaster` and any sticky booking bar do not cover it.

## Phase 6: Admin dashboard, Photo Booth section

Admin is Arabic RTL, mobile first, bottom nav in `src/components/admin/AdminNav.tsx`.

1. Add a fifth nav item "الفوتوبوث" with a badge for `REQUESTED + HELD` count (extend `NavCounts` and `getNavCounts`).
2. `/admin/booth`: queue first (held and requested, oldest first, hold countdown), then upcoming confirmed by date, search by booking id or phone (same pattern as the invitations queue).
3. `/admin/booth/calendar`: month grid, each day shows units used of total, colour for full or overbooked, tap a day to see its reservations and add a `BLOCKED` entry.
4. `/admin/booth/[id]`: all details, actions Confirm (marks deposit paid), Cancel (with reason), Mark completed, Change date (transactional), Edit, open WhatsApp chat with the customer (`customerWhatsappLink`), open in Notion, sync badge (ok, pending, error with retry).
5. `/admin/booth/new`: manual booking for phone or Instagram customers (`source: admin`).
6. `/admin/booth/settings`: unit count, holds, notice, closed weekdays, blackout dates, and a "Sync with Notion now" button showing last sync time and last error.
7. Every action uses `assertOperator`, revalidates `booth-availability`, and enqueues a Notion push (Phase 7).
8. Confirm action raises the server side `Purchase` (Phase 8).

## Phase 7: Two way Notion sync

Before coding, Claude Code must read the current Notion API docs (databases vs data sources, webhooks, signature verification, rate limits) and pin the API version it uses in one constant. Recent API versions address databases through a `data_source_id`; confirm this.

### 7.1 Notion database (Rashad creates it, Claude Code writes `docs/notion-booth-setup.md` with exact steps)

Properties (names are the contract, keep them in `src/lib/notion/booth-schema.ts`):
- `Name` (title): customer name, or "Blocked" for manual blocks
- `Booking ID` (text)
- `Status` (select): Requested, Held, Confirmed, Completed, Cancelled, Blocked
- `Event date` (date, date only)
- `Start time` (text), `Hours` (number), `Units` (number)
- `Package` (select), `Price` (number), `Deposit` (number), `Deposit paid` (checkbox)
- `Phone` (phone), `Venue` (text), `Area` (select), `Event type` (select), `Notes` (text)
- `Source` (select): Site, Admin, Notion
- `Admin link` (url, written by the site)
- `Last synced` (date, written by the site)

A Notion page created by hand with no `Booking ID` is valid: the site assigns one and writes it back.

### 7.2 Outbound (site or admin to Notion)

- `src/lib/notion/client.ts`: thin fetch client, token from `NOTION_TOKEN`, version header, retry with backoff on 429 and 5xx, respects `Retry-After`, simple queue to stay under the average rate limit.
- After every committed reservation write, set `syncState: pending` and push using `after()` from `next/server` so the customer response is not delayed: create the page if `notionPageId` is missing, otherwise update properties. Save `notionPageId`, `notionLastEditedTime`, `syncHash`, `syncState: ok`.
- On failure set `syncState: error` + `syncError`; the reconcile job retries all `pending` and `error` docs.

### 7.3 Inbound (Notion to site)

- `POST /api/notion/webhook`: handle the one time verification token handshake (log it for Rashad to paste into Notion and store it as `NOTION_WEBHOOK_SECRET`), then verify the signature header with HMAC SHA256 on every request and reject mismatches.
- Handle page created, properties updated, deleted / moved to trash, and restored events for pages in the booth data source. Webhook payloads do not carry full properties, so fetch the page, map it with `booth-schema.ts`, and upsert the reservation inside the same `boothDays` transaction used by the site.
- Deleted or trashed page: mark reservation `CANCELLED` with reason "removed in Notion" (never hard delete).
- Loop prevention: compute `syncHash` of the mapped fields; if it equals the stored hash, do nothing. This swallows the echo of our own outbound writes.
- Conflict rule: newer wins by comparing Notion `last_edited_time` against the reservation `updatedAt`. Log the losing version in a `boothReservationHistory` subcollection so nothing is silently lost.
- Respond 200 fast; do the fetch and upsert in `after()`.

### 7.4 Reconcile (safety net, because webhooks can be late or dropped)

- `POST /api/notion/reconcile` protected by `CRON_SECRET` bearer header:
  - incremental: query the data source filtered by `last_edited_time` after the stored cursor, sorted ascending, paginate, upsert each, advance cursor
  - retry outbound `pending` / `error` docs
  - release expired holds
  - nightly full pass: compare every future reservation both ways and fix drift
- Triggers:
  - Vercel cron in `vercel.json` once a day for the full pass (Hobby plans only allow daily crons; check the plan).
  - A GitHub Actions scheduled workflow every 10 to 15 minutes calling the incremental endpoint with the secret (free, and works on Hobby).
  - Opportunistic: if the availability API is read and the last incremental run is older than 5 minutes, trigger one in `after()` (with a lock doc so only one runs).
  - Admin "Sync now" button.
- One off `scripts/notion-import.ts`: imports any existing bookings already in Notion before launch.

Check: create, edit date, cancel and delete in Notion and confirm the site calendar changes within a minute via webhook and within 15 minutes with the webhook disabled; do the same from the admin and the public form and confirm Notion updates; try two simultaneous requests for the last unit and confirm only one gets it.

## Phase 8: Meta pixel + Conversions API across all pages

The existing system in `src/lib/meta/` is reused, not rebuilt. Home, `/invitations`, `/photobooth` and the booth status page all live inside `(site)` and inherit `<MetaPixel />`.

1. Add a `content_category` parameter to every event: `invitation`, `photobooth` or `home`, so campaigns and custom conversions can be split per service. Update existing invitation calls to pass `invitation`.
2. New names in `src/lib/meta/events.ts` first:
   - `ViewContent` (standard) on `/photobooth` load with `content_category: photobooth`, and when a package card is opened, with `content_name` and `value`
   - `ServiceSelected` (custom) on home service card click
   - `AvailabilityChecked` (custom) when a date is selected, with `date_status`
   - `Lead` (standard) when a booking request is created. Fire from the browser with an event id and send the server copy from the server action with the same id, including the hashed phone and `external_id` (hashed `statusToken`) for strong matching
   - `BoothWhatsAppHandoff` (custom) on "Confirm on WhatsApp"
   - `Contact` on the floating button (Phase 5)
   - `Purchase` server side only, from the admin Confirm action (and from a Notion status change to Confirmed), deterministic event id `booth-purchase-{id}` so a double confirm cannot double count, `value` = package price, `currency: EGP`, using the stored `metaAttribution` and the phone, `action_source: system_generated`
3. Extend `/api/meta/event` so it also looks up a booth reservation from its status cookie for user data, the same way it does for invitation drafts.
4. Store `metaAttribution` on the reservation at creation (same `toStoredAttribution` helper).
5. Launch checklist for Rashad: verify `qlty.events` in Meta Business Manager (DNS TXT record), add `qlty.events` to the pixel's allowed domains, create custom conversions per `content_category`, test with `META_TEST_EVENT_CODE`, then **remove it** from production env.

Check: Events Manager Test Events shows each event once as "Browser and Server" deduplicated, `/[slug]` shows nothing.

## Phase 9: qlty.events domain and production wiring

1. Vercel project `qlty-invitation`: add `qlty.events` (primary), `www.qlty.events` (redirect to apex), `admin.qlty.events`. Use the exact DNS records Vercel's domain screen shows at the registrar (apex A record or Vercel nameservers, CNAME for `www` and `admin`). Wait for SSL on all three.
2. In `src/proxy.ts`, 308 redirect the production `*.vercel.app` host to `https://qlty.events` (keep preview deployments reachable, check `VERCEL_ENV`).
3. Env on Vercel production: `NEXT_PUBLIC_SITE_URL=https://qlty.events`, Firebase vars, ImageKit, Meta pixel and CAPI token, `NOTION_TOKEN`, `NOTION_BOOTH_DATA_SOURCE_ID`, `NOTION_WEBHOOK_SECRET`, `CRON_SECRET`, optional booth WhatsApp number. Never put a secret behind `NEXT_PUBLIC_`.
4. Firebase Auth: add `qlty.events` and `admin.qlty.events` to authorised domains; confirm the admin session cookie works on the subdomain.
5. Notion webhook subscription URL: `https://qlty.events/api/notion/webhook`.
6. GitHub Actions secret `CRON_SECRET` and the reconcile URL on the production domain.
7. Meta domain verification and allowed domains (Phase 8.5).
8. Update `SETUP.md` and `README.md`: new routes, booth model, Notion setup, cron, domain. Update `CLAUDE.md` with the booth and Notion rules so future sessions keep them.
9. Schedule backups to include the new booth collections (`scripts/backup.ts`).

## Definition of done

- [ ] `/` is the QLTY home in AR and EN; `/invitations` is the builder; every old builder link still works
- [ ] `/photobooth` shows real availability from Firestore, takes requests, hands off to WhatsApp, status page works
- [ ] No double booking of the last unit under concurrent requests (tested)
- [ ] Admin Photo Booth section: queue, calendar, detail actions, manual bookings, blocks, settings, sync now
- [ ] Notion to site and site to Notion sync verified for create, update, date change, cancel, delete, with webhook and with reconcile only
- [ ] Floating WhatsApp on home, invitations, photobooth and status pages with the right prefilled message; never on guest invitations, preview or admin
- [ ] Meta events deduplicated browser + server on every customer page, `Purchase` server side for both services, test event code removed
- [ ] `qlty.events`, `www`, `admin` live on HTTPS; vercel.app redirects; sitemap and robots correct
- [ ] `npm run typecheck`, `npm run build`, `graphify update .` all clean; docs updated
- [ ] Walked end to end on a real phone in both languages
