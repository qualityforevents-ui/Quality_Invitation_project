# What still needs real values

**Updated from the live Notion database.** The prices, the deposit and the capacity are
now real, read out of the 26 bookings in 🗓️ Bookings. What is still invented is what
each tier is *called*, what its feature list *claims*, how many hours it includes, the
service areas, and every image.

Until this list is done, `BOOTH_CONFIG_IS_PLACEHOLDER` stays `true` and every booth
screen in the admin carries a warning. **The site must not be advertised to anybody
while that warning is showing**: the public page is quoting made up prices and every
photograph is an empty grey frame.

Everything here lives in one file: **`src/lib/photobooth/config.ts`**. Each item below
names the constant to change.

---

## 1. Prices and packages

`BOOTH_PACKAGES` — three tiers, **priced from your real bookings**:

| Tier | Price | Times booked | Still invented |
| --- | --- | --- | --- |
| Photo booth | 2000 | 4 | name, 4 hours, features |
| Booth and guest book | 2999 | 8 | name, 5 hours, features |
| Everything | 3500 | 5 | name, 5 hours, features |

1500, 3700 and 4000 also appear in your history. They are treated as negotiated one offs
rather than published tiers, which is what they look like. Say if any of them is really a
standard package.

**What still needs you:**

- **The hours.** Nothing in the database says how long a 2999 booking runs for. The 4, 5
  and 5 above are guesses, and they are what the site quotes an extra hour against.
- **`extraHourPrice`**, currently 500 across the board. A guess.
- **The names.** "Photo booth", "Booth and guest book", "Everything" are descriptions,
  not names you chose.
- **The feature lists.** Built from your add on columns: PhotoBooth is ticked on nearly
  every booking, Guestbook on most, Audio Guestbook occasionally. Reasonable, but it is
  what was *bought*, not what was *promised*.
- **360 Photo Booth and Plinker** are columns in your database that have never once been
  ticked. They are not sold on the site. Say if they should be.

> Changing a price here never reprices a booking already taken. The price agreed is
> written onto the reservation when it is made.

---

## 2. How many jobs you can run in a day

`BOOTH_UNIT_COUNT` — now **2**, read from your history rather than guessed: 2026-08-28
carries both "Mohamed & samiha" and "Mohamed & tasneem", and 2026-07-24 carries both
"Mahmoud & hadeer" and "Oldies". You have already run two in a day, twice.

**Confirm this is real capacity** and not two small jobs that happened to fit. If you can
only ever do one properly, set it to 1 and the calendar will close a day as soon as one
booking is confirmed.

> It can also be changed from the admin, at **Settings → عدد الفوتوبوثات**, which is what
> the operator should use. The value in the config file is the fallback for a fresh
> install with no settings document.

With more than one, the calendar starts saying "last booth" when one is left. With
exactly one that label is suppressed on purpose: every free night would otherwise be
labelled "last one", which is true, useless, and reads like the scarcity theatre fake
booking sites run.

---

## 3. The deposit

`BOOTH_DEPOSIT` — now a flat **500 EGP**, not a percentage, because that is what your
history shows: of the fifteen deposits recorded, ten are exactly 500. The others are 250,
350 and 1000, which look like negotiations rather than a rule.

A percentage would have quoted 600 on a 2000 booking and 1050 on a 3500 one, and neither
is a number you have ever asked for. Confirm 500 is the figure to quote publicly.

The deposit is settled by a human on WhatsApp over InstaPay, exactly like an invitation.
Nothing in a browser is ever told the money arrived.

---

## 4. Notice and horizon

| Constant | Now | What it means |
| --- | --- | --- |
| `BOOTH_MIN_NOTICE_DAYS` | 2 | nothing today, nothing tomorrow |
| `BOOTH_MAX_ADVANCE_DAYS` | 365 | how far ahead the calendar opens |
| `BOOTH_HOLD_HOURS` | 24 | how long the WhatsApp handoff holds a date |
| `BOOTH_CLOSED_WEEKDAYS` | none | days you never work, 0 = Sunday |

`BOOTH_HOLD_HOURS` is the one worth thinking about. It is how long a date is off the
calendar after a customer taps through to WhatsApp, which should be roughly how long it
takes you to settle a deposit in a chat. Too short and a paying customer loses their
date while they find their banking app. Too long and one tyre kicker blocks a Saturday.

All four are also editable from the admin settings screen.

---

## 5. Areas and travel

`BOOTH_AREAS` — currently Cairo (free), Giza (free), and "somewhere else" at **1500
EGP**, which is a guess.

If you do not travel outside Cairo and Giza at all, remove the third entry. The form then
offers two areas and nobody in Alexandria fills in a booking you cannot honour.

---

## 6. Photographs and video

`BOOTH_MEDIA`, `INVITATIONS_MEDIA` and `INSTAGRAM_TILES`. Every path starts with
`PLACEHOLDER` and renders as an empty framed box at the right shape.

Upload to ImageKit, then replace each path with the path inside your ImageKit endpoint
(for example `/booth/hero.jpg`, not the full URL).

| Constant | How many | Shape | Where it shows |
| --- | --- | --- | --- |
| `BOOTH_MEDIA.hero` | 1 | landscape, 4:3 | top of `/photobooth`, and the booth card on the home |
| `BOOTH_MEDIA.heroVideo` | 0 or 1 | 4:3, **silent**, a few seconds, loops | the home's booth card, instead of the photo |
| `BOOTH_MEDIA.gallery` | 6 to 9 | **square** | the gallery on `/photobooth` |
| `INVITATIONS_MEDIA.hero` | 1 | landscape, 4:3 | the invitations card on the home |
| `INSTAGRAM_TILES` | 4 | square | the strip at the bottom of the home |

Notes that will save a re-upload:

- **Square means square.** The gallery crops to square. A portrait photo loses the top
  and bottom of itself, which on a group shot is the faces.
- **The video must be silent and short.** It autoplays, and a clip with an audio track is
  a clip iOS refuses to start, which leaves a blank box.
- **Real events only.** Stock photography of somebody else's booth, on a page asking for
  eight thousand pounds, is a lie the first customer discovers at their own wedding. An
  honest grey frame is better than that, which is why the placeholder looks the way it
  does rather than showing a stock photo.
- Faces need permission. These are other people's weddings.

---

## 7. The Instagram handle

`NEXT_PUBLIC_INSTAGRAM_HANDLE`, an environment variable, defaulting to `qlty.events`.
Only needed if the real handle is different.

---

## 8. The booth phone number

`NEXT_PUBLIC_WHATSAPP_BOOTH_NUMBER`, an environment variable. **Leave it unset** unless
booth enquiries genuinely go to a different phone from invitation enquiries. Unset, both
go to `NEXT_PUBLIC_WHATSAPP_NUMBER`.

---

## 9. Notion

The database is **done**. Your 🗓️ Bookings database is wired up, three properties were
added, and the data source id is already known:

```
NOTION_BOOTH_DATA_SOURCE_ID=af2cfb8d-b3a5-4735-a717-69b915ff5d51
```

Still needed, and all covered step by step in **`docs/notion-booth-setup.md`**:

- `NOTION_TOKEN` — an internal integration secret. **The Claude connector is not this**;
  the deployed site needs its own, and the database must be shared with it
- `NOTION_WEBHOOK_SECRET` — the verification token, after the handshake
- run `npm run notion:import` once, before the booth page is advertised

---

## When the list is done

Set `BOOTH_CONFIG_IS_PLACEHOLDER = false` in `src/lib/photobooth/config.ts`, then:

```bash
npm run typecheck && npm test && npm run build
```

The warning disappears from the admin, and the booth is ready to be advertised.
