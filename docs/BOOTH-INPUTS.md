# What still needs real values

Almost nothing. This list used to be the whole booth configuration; it is now three
items.

Prices, the offer, the add ons, the deposit, the capacity and every booth photograph are
real and in place. `BOOTH_CONFIG_IS_PLACEHOLDER` is **false** and the admin no longer
warns.

---

## Still open

### 1. The transport fee outside Cairo and Giza

`BOOTH_AREAS` in `src/lib/photobooth/config.ts`. Cairo and Giza are covered at no extra
cost, which is right. **"Somewhere else" charges 1500 EGP, and that number is a guess.**

If you do not travel further than Cairo and Giza, delete the third entry and the booking
form stops offering it.

### 2. The invitations photograph on the home

`INVITATIONS_MEDIA.hero`. Still a placeholder grey frame, because every photograph
supplied is of the booth and an invitation is a screen rather than something that can be
photographed at an event. A rendered card on a phone would do.

Portrait, 4:5, uploaded to ImageKit like the booth photos.

### 3. The hero video, if you want one

`BOOTH_MEDIA.heroVideo`, currently empty, so the photograph is used instead. That is a
perfectly good outcome and there is no hurry.

If you do want one, it has to be **silent**, a few seconds, looping, and encoded for the
web. The five clips in the media folder are 9 to 27MB of phone MOV, which would make the
page slower than the photograph it replaced. They need trimming and re-encoding first.

---

## What is now real, for the record

| | |
| --- | --- |
| Package | One: **Full event coverage**, 2995 EGP, standard rate 6000 shown struck through |
| Includes | 6 hours, unlimited prints, standard guest book, full quality photos by link after the event, an attendant |
| Extra hour | 500 EGP |
| Add ons | Custom guest book +600, audio guest book +500 |
| Deposit | Flat 500 EGP |
| Booths | 1. A booked day offers WhatsApp rather than refusing |
| Photographs | 1 hero and 9 gallery, real events, on ImageKit under `/booth/` |
| Instagram strip | Four of the booth photographs |
| Payment | Card payments "coming soon". Everything else settled on WhatsApp |

### A note on the 6000

The struck through standard rate is shown because you said the usual price is 6000 and
2995 is an offer. Worth knowing: **your Notion history has no booking at 6000** — the 26
recorded bookings run from 1500 to 4000. A reference price that was never actually
charged is the kind of thing a customer or a regulator can challenge.

If 6000 is a genuine rack rate for the full six hour package and the older bookings were
shorter or smaller jobs, it is fine as it stands. If it is aspirational, set `listPrice`
to `null` in `src/lib/photobooth/config.ts` and the struck through price disappears,
leaving 2995 on its own.
