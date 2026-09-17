# Going live: the complete sequence

Everything left between here and a working `qlty.events`, in the order it has to happen.

**Where things actually stand, checked today:**

| | |
| --- | --- |
| Code | Done. 15 commits on `feat/home-photobooth`, **not pushed** |
| `qlty.events` | **Parked on Hostinger.** Nothing is deployed to it |
| `admin.qlty.events` | No DNS record at all |
| Vercel project | `qlty-invitation` exists and is linked |
| Firebase | `qlty-invitations`, working. **Indexes not deployed** |
| ImageKit | Configured, endpoint `ik.imagekit.io/e0n2xobeb` |
| Music | All 5 tracks present |
| Notion | Database ready, 3 columns added. **No integration token yet** |
| Meta | **Nothing configured** |
| InstaPay link | **Empty.** No pay button renders on the invitation |

Steps marked **you** need a password, a card or a dashboard. Steps marked **terminal**
can be run from this repo.

---

# Stage A — the decisions only you can make

Nothing below works around these. **Roughly an hour of your time.**

## A1. Fill in the booth inputs — you

Open [BOOTH-INPUTS.md](BOOTH-INPUTS.md). Prices, deposit and capacity are already real,
read out of your Notion database. What is still invented:

- **The hours each tier includes.** Currently 4 / 5 / 5. Nothing in your database records
  this, and it is what an extra hour is charged against.
- **`extraHourPrice`**, currently 500 across all three. A guess.
- **The tier names.** "Photo booth", "Booth and guest book", "Everything" are
  descriptions, not names you chose.
- **The feature lists.** Built from which add on columns you tick. Anything listed that
  you do not actually provide is a promise somebody discovers on the night.
- **Do you sell 360 Photo Booth or Plinker?** Both are columns in your database that have
  never been ticked, so neither is on the site.
- **Service areas.** Cairo and Giza are free, "somewhere else" costs 1500. The 1500 is a
  guess. If you never travel further, delete the third area.

Confirm two things read from your data:
- **Capacity 2.** You have run two events in a day twice. Is that real capacity?
- **Deposit 500.** Ten of your fifteen recorded deposits are exactly 500.

Edit `src/lib/photobooth/config.ts`, then set `BOOTH_CONFIG_IS_PLACEHOLDER = false`.

## A2. Photographs — you

All images are empty grey frames until you upload. Details and exact shapes in
[BOOTH-INPUTS.md](BOOTH-INPUTS.md) section 6.

| What | How many | Shape |
| --- | --- | --- |
| Booth hero | 1 | landscape 4:3 |
| Booth gallery | 6 to 9 | **square** |
| Invitations hero | 1 | landscape 4:3 |
| Instagram strip | 4 | square |
| Booth video (optional) | 1 | 4:3, **silent**, loops |

Upload to ImageKit, then put the **paths** (`/booth/hero.jpg`), not full URLs, into
`BOOTH_MEDIA`, `INVITATIONS_MEDIA` and `INSTAGRAM_TILES`.

## A3. The InstaPay link — you

`NEXT_PUBLIC_INSTAPAY_LINK` is **empty**, which means the invitation payment screen shows
no pay button at all. It falls back to showing the address to copy, which works but is
worse.

Get the real link from the InstaPay app. It looks like
`https://ipn.eg/S/<handle>/instapay/<code>`. It has to be found on a real phone; it
cannot be guessed.

## A4. Verify — terminal

```bash
npm run typecheck && npm test && npm run build
```

---

# Stage B — get the code onto main

## B1. Push and merge — you + terminal

```bash
git push -u origin feat/home-photobooth
```

`origin` is `qualityforevents-ui/Quality_Invitation_project`, which you confirmed is the
Vercel source. `main` is also one commit ahead locally (the Meta pixel work) and needs
pushing too.

Open a pull request, read the diff, merge. Vercel builds automatically.

At this point the site is live on its `*.vercel.app` address and you can walk the whole
thing before pointing the domain at it. **Do that.** It is much easier to fix things
before the real address works.

---

# Stage C — the three accounts

## C1. Firestore indexes — terminal

```bash
npx firebase deploy --only firestore
```

Deploys the indexes and the deny all rules. The customer facing calendar deliberately
needs no composite index, so the public site works without this — but the **admin booth
queue will 500** until it is done.

## C2. Notion — you

Full steps in [notion-booth-setup.md](notion-booth-setup.md). The database is already
done; this is the token.

1. <https://www.notion.so/my-integrations> → **New integration**, name it `QLTY site`,
   workspace **Modern Sciences and Arts University**.
2. Capabilities: **Read**, **Update**, **Insert** content. Leave user information off.
3. Copy the secret (starts `ntn_`) → `NOTION_TOKEN`.
4. Open **🗓️ Bookings** → **•••** → **Connections** → **Connect to** → `QLTY site`.
   Nothing works until this is done and the error does not say so.

The data source id is already known:

```
NOTION_BOOTH_DATA_SOURCE_ID=af2cfb8d-b3a5-4735-a717-69b915ff5d51
```

> **The Claude connector is not this.** That is a chat session authenticating as you. The
> deployed site needs its own integration and will not have your session at 2am.

## C3. Meta — you

1. **Business Manager → Brand Safety → Domains**: add `qlty.events`, verify with the DNS
   TXT record it gives you. Without this the pixel cannot attribute much under iOS.
2. **Events Manager → your pixel → Settings → Domains**: add `qlty.events`.
3. Copy the pixel id → `NEXT_PUBLIC_META_PIXEL_ID`.
4. **Settings → Conversions API → Generate access token** → `META_CAPI_ACCESS_TOKEN`.
5. Create custom conversions split on `content_category`, which every event carries:
   `invitation`, `photobooth`, `home`.

## C4. The cron secret — terminal

```bash
openssl rand -base64 32
```

→ `CRON_SECRET`. The same value goes in Vercel and in GitHub.

---

# Stage D — infrastructure

## D1. Vercel environment variables — you

Project `qlty-invitation` → **Settings → Environment Variables → Production**:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://qlty.events` |
| `FIREBASE_PROJECT_ID` | `qlty-invitations` |
| `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | from the service account |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | `https://ik.imagekit.io/e0n2xobeb/` |
| `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY` | from ImageKit |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `201010014346` |
| `NEXT_PUBLIC_INSTAPAY_LINK` | from A3 |
| `NEXT_PUBLIC_META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN` | from C3 |
| `NOTION_TOKEN`, `NOTION_BOOTH_DATA_SOURCE_ID` | from C2 |
| `CRON_SECRET` | from C4 |

Leave `NOTION_WEBHOOK_SECRET` for D4. Never set `FIRESTORE_EMULATOR_HOST`.

> Nothing secret may carry the `NEXT_PUBLIC_` prefix — that compiles it into the
> JavaScript every visitor downloads. The Meta token, the Notion token, the ImageKit
> private key, the Firebase private key and the cron secret are all secret.

Redeploy after adding them. They are read at build time.

## D2. The domain — you

**This is the big one. `qlty.events` is currently a parked Hostinger page.**

**In Vercel** → project → **Settings → Domains**, add three:

| Domain | Configure as |
| --- | --- |
| `qlty.events` | **Primary** |
| `www.qlty.events` | Redirect to `qlty.events` |
| `admin.qlty.events` | Normal domain, no redirect |

Vercel then shows the exact DNS records for each.

**In Hostinger** → hPanel → **Domains → DNS / Nameservers**:

- **Delete the parking records.** The apex `A` record currently points at `2.57.91.91`,
  which is Hostinger's parking page, and `www` is a CNAME to it. Both must go.
- Add what Vercel showed you: normally an `A` record on the apex, a `CNAME` for `www`,
  and a `CNAME` for `admin` — which **does not exist at all today**.

> **Use the values Vercel's screen shows, not any written here.** Vercel changes its
> addresses, and a value copied out of a document is how a domain ends up pointing at
> nothing.

The alternative, if you would rather not manage records: point the whole domain at
Vercel's nameservers from Hostinger. Less control, less to get wrong.

Wait for all three to read **Valid Configuration** and for SSL to issue. Minutes,
occasionally hours. Do not continue until all three load over HTTPS.

## D3. Firebase authorised domains — you

**Authentication → Settings → Authorised domains**, add:

- `qlty.events`
- `admin.qlty.events`

Admin sign in fails on the new hostnames until these are there. Then sign in at
`https://admin.qlty.events` and confirm the session survives a reload.

## D4. The Notion webhook — you

Needs D2 finished, because the URL has to be reachable. **This cannot be done from
Claude** — webhook subscriptions belong to an integration, are created in its settings
dashboard, and Notion has no API for it.

1. Your integration → **Webhooks** → **Create a subscription**.
2. URL: `https://qlty.events/api/notion/webhook`
3. Events: **page.created**, **page.properties_updated**, **page.deleted**,
   **page.undeleted**, **page.moved**.
4. Notion posts a one time verification token. Find it in the Vercel logs:
   `[notion/webhook] verification token received...`
5. Paste it into Notion to verify.
6. Set the same value as `NOTION_WEBHOOK_SECRET` in Vercel and redeploy.

Step 6 is not optional. Until it is set the endpoint refuses everything with a 503,
because an unverified webhook is an open door to your Notion on our token.

## D5. GitHub Actions — you

Repository → **Settings → Secrets and variables → Actions**:

- `CRON_SECRET` — same value as Vercel
- `SITE_URL` — `https://qlty.events`

Run the **Photo booth Notion sync** workflow by hand from the Actions tab and confirm it
returns 200.

## D6. Import the existing bookings — terminal

```bash
npm run notion:import
```

**Before the booth page is advertised**, or the calendar will sell dates that are already
sold. Pulls your 26 bookings in. Safe to re-run.

Reports nothing to Meta, by design.

## D7. Back up — terminal

```bash
npm run backup
```

Run it once now, and copy the file off the machine. Firestore's free tier has no
scheduled export, and this file is the only copy of your wedding dates and phone numbers
that is not in Google's hands. `SETUP.md` covers scheduling it.

---

# Stage E — prove it works

On a **real phone**, in **both languages**. A desktop browser will not reproduce Safari's
cookie handling, the iOS keyboard, or the WhatsApp handoff.

## The site

| Check | Expected |
| --- | --- |
| `qlty.events` | the home, Arabic, right to left |
| `www.qlty.events` | redirects to the apex |
| the old `*.vercel.app` address | redirects to `qlty.events` |
| `qlty.events/?package=UNLIMITED` | lands on `/invitations`, tier chosen |
| `qlty.events/build` | redirects to `/invitations` |
| an existing invitation link | still opens |
| an existing edit link | opens the builder with the draft in it |
| `qlty.events/sitemap.xml` | four URLs, no slugs, no admin |
| `qlty.events/robots.txt` | disallows `/admin`, `/edit/`, `/build/`, `/photobooth/request/` |

## The booth, end to end

1. Open `/photobooth`. The calendar shows real dates, and the nights already booked in
   Notion are **not** offered.
2. Book one. Check the price and deposit on the summary.
3. Tap **Confirm on WhatsApp**. The message arrives with the booking id.
4. That date disappears from the calendar.
5. **Open the same date in a second browser at the same moment.** One is refused and
   offered three other dates. This is the one failure that costs you a wedding.
6. In the admin, the booth tab badges the new booking.
7. Confirm it. `Deposit Received` ticks in Notion.
8. Change the date in Notion. The site calendar follows within a minute.
9. Delete the Notion row. The booking is **cancelled**, not deleted, and the date returns.

## Meta

1. Set `META_TEST_EVENT_CODE` temporarily and open **Test Events**.
2. Walk both funnels. Every event appears **once**, marked **Browser and Server**. Two
   rows for one event means the ids are not pairing.
3. Open a real invitation link `qlty.events/<slug>` and confirm **nothing** is reported.
   Guests are not customers.
4. **Remove `META_TEST_EVENT_CODE` and redeploy.** Left set, every conversion goes to the
   test tab, the live dataset gets nothing, and every campaign optimises on an empty
   pixel.

---

# Rough order of effort

| Stage | Who | Time |
| --- | --- | --- |
| A — inputs, photos, InstaPay link | you | ~1 hour, plus a photo shoot |
| B — push and merge | you | 15 min |
| C — indexes, Notion, Meta, secret | you | ~45 min |
| D — Vercel, DNS, Firebase, webhook, import | you | ~1 hour, plus DNS propagation |
| E — testing on a phone | you | ~45 min |

**The long pole is Stage A.** Everything else is dashboards; the photographs and the
package details are the part that needs a decision and a camera.

---

# If something is wrong

| Symptom | Look at |
| --- | --- |
| Booth calendar empty, console shows 503 | Firebase credentials in Vercel |
| Admin booth queue 500s | Firestore indexes, C1 |
| Admin loads but sign in fails | Firebase authorised domains, D3 |
| Meta shows every event twice | browser and server ids not pairing |
| Meta shows nothing | `META_TEST_EVENT_CODE` still set |
| Notion never syncs | token missing, or database not shared, C2 |
| Notion webhook silent, cron works | subscription unverified or `NOTION_WEBHOOK_SECRET` unset |
| Booth admin warns about placeholders | `BOOTH_CONFIG_IS_PLACEHOLDER` still true, A1 |
| No pay button on the invitation | `NEXT_PUBLIC_INSTAPAY_LINK` empty, A3 |
