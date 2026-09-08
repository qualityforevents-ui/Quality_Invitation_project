# qlty.events digital invitations

Self serve digital invitation builder for the Egyptian market. A customer builds a
mobile invitation, previews the whole thing, pays 300 EGP over InstaPay, and gets a
link to send guests on WhatsApp.

No customer accounts exist anywhere in this codebase. Access to an invitation is by
secret token only.

**Start here: [SETUP.md](SETUP.md).** Nothing that touches the database runs until the
Firebase project is provisioned. Local development runs against the Firestore emulator
and needs no credentials at all.

---

## Where things are

```
src/lib/types.ts          the data model, written by hand since Firestore has no schema
src/lib/db.ts             Firestore handles, credentials, Timestamp to Date
src/lib/firebase/auth.ts  operator sign in and the session cookie
firestore.indexes.json    the two composite indexes the admin lists sort by
firestore.rules           deny everything: no browser talks to Firestore, only the server
src/lib/tokens.ts         editToken, requestId, slug suffixes
src/lib/slug.ts           Arabic to Latin transliteration
src/lib/format.ts         dates and times, resolved in Africa/Cairo
src/lib/invitations.ts    create, patch, status transitions
src/i18n/ui.ts            all builder and landing copy, both languages
src/i18n/invitation.ts    copy inside the card, written twice not translated
src/themes/registry.ts    theme colours, font pairs, defaults
src/themes/hadiqa/        one theme per folder, nine of them
src/components/invitation/  cover, reveal, countdown, audio, ornaments
src/lib/flow/               section order, values, the autosave patch
src/components/flow/        the one page flow and its questions
```

## Running it

```sh
npm install
npm run dev
```

Open it from your phone on the same network using the machine's local IP. Arabic
rendering, RTL, and iOS audio all behave differently there than in a desktop browser,
and that is the only test that counts.

```sh
npm run typecheck     # tsc, no emit
npm run build         # production build
npm run check:music   # which audio files are still missing
npm run backup        # dump every row to backups/
```

---

## The one page flow

The customer product used to be four routes: `/build`, `/build/theme`, `/build/preview`
and `/build/payment`. It is now one page at `/` that asks one question at a time. Every
answered question collapses to a single tappable row above the live one, so the whole of
what somebody has told us stays on screen and any of it can be corrected in one tap
without rewinding anything after it.

The interface is built from [shadcn/ui](https://ui.shadcn.com) components in
`src/components/ui`. They are not themed at the call site: the shadcn token slots in
`globals.css` are pointed at the existing brand values, so `--primary` *is* the gold the
invitation uses as its accent and a plain `<Button>` comes out gold on cream.

```
src/lib/flow/sections.ts     the order, as data, plus which questions apply
src/lib/flow/values.ts       FlowValues, seeding, and toPatch
src/lib/flow/preview-view.ts builds an InvitationView from local state
src/components/flow/         the orchestrator, the shell, and the questions
```

Four things about it are load bearing:

- **`toPatch` owns the all or nothing rule.** A patch is rejected whole by the server, so
  a half typed Google Maps link is left out of it rather than sent and refused. Every
  field that can be invalid is excluded there and nowhere else.
- **The date and the time start empty.** The old form pre filled a date sixty days out,
  which is indistinguishable from a chosen one the moment it is stored. `createDraft`
  still writes that default, so the flow, not the database, is what stops somebody paying
  for a day they never picked.
- **Where a customer got to is a cookie, not a column.** `qlty_step` holds the furthest
  section, and `clampFurthest` refuses to trust it past the first unanswered question. A
  lost cookie costs a few taps; it can never skip one.
- **The preview is a full bleed dialog that mounts on the unopened cover.** It has to be
  tapped open, because `audio.start()` is only accepted by Safari while that tap is still
  on the stack.

The four old paths redirect to `/` and carry their query string, so
`/build?package=UNLIMITED` still arrives with that tier selected.
`/build/status/<editToken>` was deliberately **not** moved: it is where every paying
customer lands and it is inside messages already sent.

---

## What is built

Stages 1 to 6 of the build order.

| Stage | State |
|---|---|
| 1. Schema, tokens, request ids, cron, backup | Done |
| 2. Builder form, autosave, cookie resume | Done |
| 3. Classic theme, Arabic, no photo | Done |
| 4. Open animation and audio unlock | Done |
| 5. Preview screen | Done |
| 6. Payment and WhatsApp handoff | Done |
| 7. Admin auth, pending list, request id search, activate | Done |
| 8. Static generation and revalidation | Done |
| 9. ImageKit upload, HEIC, compression, EXIF, cropper | Done, HEIC still unverified |
| 10. English invitation layout | Done |
| 11. Music library and selector | Done, audio files pending |
| 12. Themes two through four | Done |
| 13. Open Graph image generation | Done |
| 14. Admin editing, stats, drafts list | Done |

All fourteen stages are written, and everything above has now run against a real Supabase
project and a real ImageKit account. A synthetic photo has been through the whole
pipeline: upload signature accepted, crop stored as coordinates, delivered at 49KB with
no EXIF or GPS markers left in the bytes.

Two gaps remain, and neither can be closed from a desktop:

- **HEIC has never been decoded.** It is the iPhone default and the single most likely
  upload failure in this market, and it needs a real photo off a real camera roll.
- **No music file has ever played.** The library is empty, so the fade in, the loop and
  the mute toggle are unproven.

The customer path runs end to end: landing, event details, design and music, full
preview, payment, WhatsApp handoff, waiting screen that flips itself to the success
screen once the invitation goes live.

### How the classic theme is put together

The two reference invitations flow as one column with the same flourish between every
section. This card deliberately does not, so that it reads as its own thing:

- A **monogram seal** carries the couple's initials. It leads the cover, and on the card
  it sits between the two names where an ampersand would otherwise go.
- The date, the hour and the venue are gathered into **one bordered panel** rather than
  strung out as three sections with an identical divider between each. Those are the
  details a guest reopens the card to check, so they stay together, and the ornamental
  dividers are left to mark real changes of subject. There are three, not seven.
- The **date is set formally**: weekday above, the day large between two rules, month and
  year below. `formatEventDateParts` exists to feed it.
- The **countdown is four rings**, not four filled tiles, so it does not read as a row of
  interface buttons.
- **Roles sit under a rule each** rather than either side of one shared vertical hairline.

### Support

`SupportButton` is a floating WhatsApp bubble, bottom right, in WhatsApp green rather
than the site's gold: it has to read as WhatsApp at a glance. It is pinned to the
physical right, not the logical end, so it does not swap corners when somebody changes
language.

It appears on the one page flow and on the waiting screen, where
it carries the request id into the prefilled message. Pass `raised` on any screen with a
fixed bottom bar so the bubble clears it.

It is deliberately absent from the invitation and from the preview. Guests must never
see it, and the preview is the customer looking at their own card exactly as a guest
will.

The three links from section 6 are separate and behave as specified. The public page
carries no editToken and no id, in HTML or in the props sent to the browser: the theme
is handed an `InvitationView` built in `src/lib/invitation-view.ts`, which has neither.

### What is verified, and what is not

Checked in a browser at 390px, in both directions:

- Landing, Arabic and English
- The full invitation at `/sample`, opened, scrolled, both languages
- Builder form, Arabic and English
- Theme step and payment step
- Date and time formatting, including Cairo daylight saving. August resolves to UTC+3
  and December to UTC+2, so the countdown is right on both sides of the transition.
- Slug transliteration. Both reference invitations reproduce exactly: مُعَاذ and رِيم
  give `moaaz-reem`, حمدي and فاطمة give `hamdy-fatma`.

The full path has since been walked end to end against the real Supabase project and a
real ImageKit account: draft created, autosaved, resumed from the cookie, photo uploaded
and cropped, previewed, handed off to WhatsApp, activated from the admin, and served
live at its public slug with a generated Open Graph card. The public page was checked
for an editToken leak and has none.

**Still not verified, and not verifiable from a desktop:**

- **HEIC.** The iPhone default, and the most likely upload failure in this market. It
  needs a real photo off a real camera roll.
- **Audio.** No music file exists, so nothing has ever played.
- **Anything on a physical phone.** Section 16 of the spec is not satisfied and only you
  can satisfy it. Three of the bugs found so far only appeared at human clicking speed.

---

## Deviations from the spec

Seven, and one of them needs a decision from you.

**0. The hosting families line and the dress code are gone.** Removed on request, after
the spec was written. They are out of the Prisma model, the validation schema, the
builder form, the invitation, and both dictionaries, rather than hidden in the
interface, so nothing carries a column that no longer means anything. No migration was
needed because no database existed yet. Section 8.2 of the spec still lists both fields;
this README is the newer instruction. Putting either back is a schema change plus a form
field plus a section in each theme.

The English card keeps its "Together with their families" opening. It names nobody and
is standard English invitation phrasing, doing the job the Bismillah does on the Arabic
side, so it is not the field that was removed.

**1. Prisma 7 moved the connection URLs out of the schema.** The spec describes
putting `url` and `directUrl` in `schema.prisma`. Prisma 7 removed both properties.
The behaviour the spec asks for is unchanged, it is just configured in two places now:

- Runtime uses `DATABASE_URL`, the pooler on port 6543, through the pg driver adapter
  in `src/lib/db.ts`, with the pool capped at one connection per function invocation.
- Migrations use `DIRECT_URL`, the direct connection on port 5432, set in
  `prisma.config.ts` where only the CLI reads it.

`?pgbouncer=true&connection_limit=1` were parameters Prisma's own engine understood.
The pg driver passes anything it does not recognise to Postgres as a startup parameter
and the connection fails, so `src/lib/db.ts` strips them. Keep them on the URL or take
them off, either works.

**2. Backup scheduling is not automated.** This is the one item I could not close.
`npm run backup` works now and dumps every row to `backups/`. But the single daily
Vercel Hobby cron is taken by the heartbeat, and a Vercel function has nowhere durable
to write, so the schedule has to live somewhere you control. SETUP.md section 6 sets
out the two workable options. **Pick one before you take real money**, because the free
Supabase plan has no backups at all.

**3. Arabic fonts are subset by range, not by character.** The spec asks for subsetting
to the characters actually used. That is unreachable here: the largest text on the card
is the couple's names, which are user input and unknown at build time. What is loaded
is the Arabic and Latin unicode ranges rather than the whole face, and an Arabic card
never fetches the Latin file.

**4. Slug transliteration is best effort.** Arabic does not write short vowels, so حمدي
is literally h, m, d, y. `src/lib/slug.ts` handles this in three passes: Latin input is
passed through untouched, a dictionary of common Egyptian names covers most real
traffic exactly, and anything else falls back to a character map that repairs an
unpronounceable opening consonant cluster. It will still get some names wrong. The
admin slug override at stage 14 is the backstop, and until it exists a wrong slug can
be fixed in the database directly.

**5. `expiresAt` has no policy yet.** `DEFAULT_EXPIRY_DAYS_AFTER_EVENT` is defined as
30 days after the event in `src/lib/constants.ts` but nothing sets the column, because
nothing activates an invitation until stage 7. Change the number if 30 is wrong.

**6. English invitation content is already written.** The spec puts it at stage 10. It
came for free: the theme is driven by direction and font variables rather than
duplicated markup, so once the copy existed both languages rendered. It is written
separately from the Arabic, not translated. The Arabic card carries the Bismillah, the
verse from Ar-Rum, and classical verse. The English one has none of those and uses
"Together with their families" and "request the pleasure of your company" instead.

Two smaller notes:

- The photo section on the theme step is a labelled placeholder, since upload is stage 9.
- The mute toggle hides itself when a track file is missing rather than showing a
  control that does nothing. Once the audio files land it is always visible, which is
  what tells an iPhone user with the silent switch on why the card is quiet.

---

## Things that will bite if you forget them

- **No double hyphens in customer facing text.** The rule is enforced in copy and
  comments. CSS custom properties use two hyphens because the language requires it.
- **Audio cannot start without a tap.** `useInvitationAudio.start()` must stay
  synchronous inside the open handler. Put an `await` before it and Safari stops
  treating it as user initiated, and the music silently never plays.
- **Do not force a direction onto text containing Arabic words.** The `numeric` utility
  sets `direction: ltr` and belongs on bare digits only. Applied to "24 سبتمبر 2026" it
  reorders the date. Use `<bdi>` to isolate a Latin run without changing alignment.
- **The Bismillah glyph is about eleven times wider than its font size.** It is sized
  with a container query in the classic theme. Any new theme that renders it needs the
  same treatment or it runs off both edges of a phone.
- **Autosave patches are all or nothing.** One invalid field rejects the whole patch,
  so the builder leaves invalid optional fields out rather than sending them. Keep that
  up when adding fields.
- **Theme colours must go through `@theme inline`, not `@theme`.** A plain `@theme`
  block is resolved at build time, so `--color-inv-bg: var(--inv-bg, #faf5ec)` compiles
  to the literal fallback and every theme silently renders the classic palette. This
  went unnoticed while all the themes were light and was only obvious once a dark one
  existed. See the comment in `globals.css`.
- **Satori reverses multi word Arabic.** The Open Graph renderer draws
  "قاعة النيل الكبرى" as "الكبرى النيل قاعة", and the `direction` property makes no
  difference. `satoriText` in `src/lib/og.tsx` reverses the words on the way in to
  cancel it out. That only works for a line that is one phrase: a line mixing Arabic, a
  separator and digits has several bidi runs and comes out wrong however it is fed in,
  which is why the date, venue and occasion each get their own line. Do not join them.
- **Satori cannot parse most Arabic fonts.** It rejects the contextual substitution
  lookups that Amiri and Scheherazade New use for Naskh joining, and cannot read
  variable fonts at all. Tajawal and Almarai were the only two of six candidates that
  worked. If you change the Open Graph font, render one and look at it before trusting
  it.
- **Never type an Arabic diacritic range into a regex literally.** Combining marks are
  invisible in an editor, so a range that looks like it covers the tashkeel can quietly
  cover `U+0621` to `U+064A`, which is every Arabic letter. That exact mistake was made
  in `src/lib/initials.ts` and silently returned an empty string for every Arabic name.
  Both mark regexes, in `initials.ts` and `slug.ts`, are now written as `\u` escapes.
  Keep them that way, and test any change against a name carrying tashkeel.

## Next

The code is complete. What remains is everything only you can do.

1. **Provision Supabase and run the migration.** SETUP.md steps 1 to 3. Disable public
   signup while you are in there. Nothing that writes has ever run.
2. **Walk the whole customer path on a real phone.** Every question, preview, pay, hand
   off to WhatsApp, then activate it from the admin and watch the waiting screen flip.
   That is the first time most of this code will have executed.
3. **Add the eight music files.** `npm run check:music` tells you what is missing.
4. **Create the ImageKit account and try a real iPhone photo**, HEIC straight from the
   camera roll. Confirm it decodes, that the result is around 500KB, and that the
   delivered image carries no EXIF.
5. **Decide how backups get scheduled** before you take real money.
6. Point `admin.qlty.events` at the deployment. The subdomain is handled in
   `src/proxy.ts`; locally the admin is just `/admin`.
