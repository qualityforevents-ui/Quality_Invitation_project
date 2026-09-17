# What still needs real values

Everything the photo booth was built around was invented, because none of it was
supplied. The numbers are plausible; not one of them is true.

Until this list is done, `BOOTH_CONFIG_IS_PLACEHOLDER` stays `true` and every booth
screen in the admin carries a warning. **The site must not be advertised to anybody
while that warning is showing**: the public page is quoting made up prices and every
photograph is an empty grey frame.

Everything here lives in one file: **`src/lib/photobooth/config.ts`**. Each item below
names the constant to change.

---

## 1. Prices and packages

`BOOTH_PACKAGES` — three tiers. For each one:

| Field | What it is | Currently |
| --- | --- | --- |
| `price` | EGP, the whole booking | 3500 / 5500 / 8000 |
| `hours` | booth time included | 2 / 4 / 5 |
| `extraHourPrice` | EGP per hour beyond that | 1000 / 1000 / 1200 |
| `nameAr`, `nameEn` | what the tier is called | الأساسية / الليلة كاملة / المميزة |
| `taglineAr`, `taglineEn` | one line under the name | invented |
| `featuresAr`, `featuresEn` | the bullet list | invented |

**The feature lists matter most.** They are what a customer is comparing, and they
currently describe a booth nobody has seen: a props box, a named print frame, a guest
book, a short film. Anything in there you do not actually provide is a promise made to
somebody who will notice on the night.

There can be fewer or more than three tiers. Nothing assumes three.

> Changing a price here never reprices a booking already taken. The price agreed is
> written onto the reservation when it is made.

---

## 2. How many booths you own

`BOOTH_UNIT_COUNT` — currently **1**.

This is the hard ceiling on bookings per day and the single most important number in the
whole system. With one booth, one confirmed booking closes the day.

> It can also be changed from the admin, at **Settings → عدد الفوتوبوثات**, which is what
> the operator should use. The value in the config file is the fallback for a fresh
> install with no settings document.

With more than one, the calendar starts saying "last booth" when one is left. With
exactly one that label is suppressed on purpose: every free night would otherwise be
labelled "last one", which is true, useless, and reads like the scarcity theatre fake
booking sites run.

---

## 3. The deposit

`BOOTH_DEPOSIT_PERCENT` — currently **30%**, rounded to the nearest 50 EGP.

So a 5500 booking asks for 1650. If you take a flat figure instead, say it and the
function becomes a constant.

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

Four values, all covered step by step in **`docs/notion-booth-setup.md`**:

- `NOTION_TOKEN` — an internal integration secret
- `NOTION_BOOTH_DATA_SOURCE_ID` — **the data source id, not the database id**
- `NOTION_WEBHOOK_SECRET` — the verification token, after the handshake
- the database itself, with the exact property names in that document

---

## When the list is done

Set `BOOTH_CONFIG_IS_PLACEHOLDER = false` in `src/lib/photobooth/config.ts`, then:

```bash
npm run typecheck && npm test && npm run build
```

The warning disappears from the admin, and the booth is ready to be advertised.
