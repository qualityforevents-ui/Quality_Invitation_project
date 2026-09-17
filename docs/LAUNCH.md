# Launching qlty.events

Everything that has to happen outside this repository, in the order it has to happen.

Each step says who can do it. The ones marked **Rashad only** need a password, a card,
or a dashboard login, and cannot be done from a terminal by anybody else.

---

## 0. Before any of this

Fill in the placeholders. The booth is currently quoting invented prices, and the admin
shows a warning on every booth screen until somebody has been through them.

See **`docs/BOOTH-INPUTS.md`** for the list. Nothing below depends on it, but the site
must not be advertised until it is done.

---

## 1. The domain — Rashad only

In the Vercel project (`qlty-invitation`), **Settings → Domains**, add three:

| Domain              | Configure as                          |
| ------------------- | ------------------------------------- |
| `qlty.events`       | **Primary**                           |
| `www.qlty.events`   | Redirect to `qlty.events`             |
| `admin.qlty.events` | Normal domain, no redirect            |

Vercel then shows the exact DNS records to add at the registrar. **Use the records the
screen shows you, not the ones written here** — Vercel changes its anycast addresses and
a value copied from a document is how a domain ends up pointing at nothing.

It is normally one of:

- an `A` record on the apex plus `CNAME` records for `www` and `admin`, or
- moving the whole domain onto Vercel's nameservers, which is less work and less control

Wait for all three to show **Valid Configuration** and for the SSL certificates to be
issued. This usually takes minutes and can take a few hours. Do not continue until all
three load over HTTPS.

`admin.qlty.events` is not a second deployment. `src/proxy.ts` rewrites anything on that
hostname onto the `/admin` route tree of the same app.

---

## 2. Environment variables — Rashad only

In **Settings → Environment Variables**, on **Production**:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://qlty.events` |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | from the service account |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`, `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY` | from ImageKit |
| `NEXT_PUBLIC_META_PIXEL_ID` | the pixel id |
| `META_CAPI_ACCESS_TOKEN` | the Conversions API token |
| `NOTION_TOKEN`, `NOTION_BOOTH_DATA_SOURCE_ID`, `NOTION_WEBHOOK_SECRET` | see `docs/notion-booth-setup.md` |
| `CRON_SECRET` | `openssl rand -base64 32` |
| `NEXT_PUBLIC_WHATSAPP_BOOTH_NUMBER` | optional, only if booth enquiries go to a different phone |

> **Nothing secret may be given the `NEXT_PUBLIC_` prefix.** That prefix compiles the
> value into the JavaScript every visitor downloads. `META_CAPI_ACCESS_TOKEN`,
> `NOTION_TOKEN`, `IMAGEKIT_PRIVATE_KEY`, `CRON_SECRET` and the Firebase private key are
> all secret. The ones that already carry the prefix are public by nature: a pixel id is
> in the page source of every site that has one.

Redeploy after adding them. Environment variables are read at build time.

---

## 3. Firebase — Rashad only

**Authentication → Settings → Authorised domains**, add:

- `qlty.events`
- `admin.qlty.events`

The admin sign in will not work on the new hostnames until these are there, and the
error it gives says the domain is unauthorised, which is at least honest.

Then sign in at `https://admin.qlty.events` and confirm the session survives a reload.
The session cookie is set on the subdomain it was issued on.

**Deploy the Firestore indexes** — this one can be done from a terminal:

```bash
npx firebase deploy --only firestore:indexes
```

The customer facing calendar deliberately needs no composite index, so the public site
works without this. The admin queue and the Notion retry do need them.

---

## 4. Meta — Rashad only

1. **Business Manager → Brand Safety → Domains**, add `qlty.events` and verify it with
   the DNS TXT record it gives you. This is what lets the pixel attribute conversions on
   this domain at all under iOS restrictions.
2. **Events Manager → your pixel → Settings → Domains**, add `qlty.events`.
3. Create custom conversions split by `content_category`, which every event now carries:
   - `invitation` — the invitation funnel
   - `photobooth` — the booth funnel
   - `home` — visitors who have not chosen yet
4. Set `META_TEST_EVENT_CODE` temporarily and watch **Test Events**. Walk both funnels on
   a real phone. Each event should appear **once**, marked **Browser and Server**. Two
   separate rows for the same event means the event ids are not pairing.
5. **Remove `META_TEST_EVENT_CODE` and redeploy.** Left set in production, every
   conversion goes to the test tab, the live dataset receives nothing, and every campaign
   optimises against an empty pixel.
6. Open a real invitation link (`qlty.events/<slug>`) and confirm **nothing** is
   reported. Guests are not customers, and pixelling them would build lookalike
   audiences out of people who will never buy.

---

## 5. Notion

Follow **`docs/notion-booth-setup.md`** end to end. The webhook step needs the site to
be live on `https://qlty.events`, so it comes after step 1.

The webhook subscription URL is:

```
https://qlty.events/api/notion/webhook
```

---

## 6. The scheduled sync

**GitHub repository → Settings → Secrets and variables → Actions**, add:

- `CRON_SECRET` — the same value as in Vercel
- `SITE_URL` — `https://qlty.events`

The workflow is already committed at `.github/workflows/booth-sync.yml` and runs every
fifteen minutes. Trigger one by hand from the Actions tab to confirm it returns 200.

The nightly full pass is in `vercel.json` and needs nothing beyond `CRON_SECRET`.

---

## 7. Backups — Rashad only

```bash
npm run backup
```

writes every invitation, review and booth booking to `./backups`. It is gitignored,
because it holds customer names and phone numbers.

Firestore's free tier has no scheduled export, so this has to be run and the file copied
somewhere off the machine. `SETUP.md` covers the two practical ways to schedule it.

Run it once before launch, so there is a known good file from before any of this.

---

## Checking it actually works

Walk these on a real phone, in both languages. A desktop browser will not reproduce the
things that break: Safari's cookie handling, the iOS keyboard, and the WhatsApp handoff.

| Check | Expected |
| --- | --- |
| `qlty.events` | the home, in Arabic, right to left |
| `www.qlty.events` | redirects to `qlty.events` |
| the old `*.vercel.app` address | redirects to `qlty.events` |
| `qlty.events/?package=UNLIMITED` | lands on `/invitations` with the tier chosen |
| `qlty.events/build` | redirects to `/invitations` |
| an old invitation link `qlty.events/<slug>` | opens, and reports nothing to Meta |
| an old edit link `qlty.events/edit/<token>` | opens the builder with the draft in it |
| `qlty.events/photobooth` | the calendar loads with real dates |
| a full booking, to the WhatsApp handoff | the date disappears from the calendar |
| the same date, in a second browser, at the same time | refused, with three other dates offered |
| `admin.qlty.events` | the admin, and the booth tab shows the booking |
| confirming it in the admin | Meta records a `Purchase` |
| editing the date in Notion | the site calendar follows within a minute |
| deleting the Notion row | the booking is cancelled, not deleted, and the date returns |
| `qlty.events/sitemap.xml` | four URLs, none of them a slug or an admin page |
| `qlty.events/robots.txt` | disallows `/admin`, `/edit/`, `/build/`, `/photobooth/request/` |

---

## If something is wrong

| Symptom | Look at |
| --- | --- |
| The booth calendar shows nothing and the console says 503 | Firestore credentials, or the indexes in step 3 |
| The admin loads but sign in fails | Firebase authorised domains, step 3 |
| Meta shows each event twice | the browser and server copies are not pairing on event id |
| Meta shows nothing at all | `META_TEST_EVENT_CODE` is still set, step 4.5 |
| Notion changes never arrive | `docs/notion-booth-setup.md`, the section at the end |
| The admin booth screens warn about placeholders | `docs/BOOTH-INPUTS.md`, still unfilled |
