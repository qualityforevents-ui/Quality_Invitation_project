# Notion booth sync: setting it up

The site mirrors booth bookings into the **🗓️ Bookings** database you already run on, in
both directions. Edit a booking in the admin and Notion updates; drag a date in Notion
and the site's calendar follows.

It uses your existing database. Your columns, your habits, your 26 bookings. Three
properties were added and nothing was renamed, retyped or deleted.

- Database: **🗓️ Bookings**
- Database id: `babf466f-38c9-4df0-ad84-4373028df81e`
- Data source id: `af2cfb8d-b3a5-4735-a717-69b915ff5d51` ← **this is the one the site needs**

> The property names are a contract. The site reads and writes the exact names in
> `src/lib/notion/booth-schema.ts`. Renaming a column in Notion breaks the sync with
> nothing to catch it at build time. If this document and that file ever disagree, **the
> file is right and this document is stale**.

---

## 1. What was added, and why

Three properties, all additive:

| Property | Type | Why it was needed |
| --- | --- | --- |
| `Booking ID` | Text | The reference a customer quotes on WhatsApp and the operator searches by. Nothing existing could serve as one. |
| `Status` | Select | `Requested`, `Held`, `Confirmed`, `Completed`, `Cancelled`, `Blocked`. Your checkboxes cannot express a website hold, a cancellation or a blocked day. |
| `Admin link` | URL | Written by the site. One tap from a Notion row to the screen that can change it. |

**Your checkboxes stay the interface.** `Deposit Received` and `Done` are what your views
and your calendar are built on, so the site keeps writing them:

- the site confirms a booking → `Deposit Received` is ticked
- the site completes one → `Done` is ticked
- you tick `Deposit Received` yourself → the site reads it as Confirmed

`Status` is written alongside them and wins when it is set. On all 26 existing rows it is
empty, and the site falls back to reading the checkboxes, so nothing had to be
backfilled.

---

## 2. How your columns map

| Your column | Site field | Notes |
| --- | --- | --- |
| `Client Name` | customer name | "Blocked" on a manual block |
| `Date` | event date | Day only. Never a time. |
| `Time` | start time + hours | Free text, parsed. See below. |
| `Package Price` | price | Select, parsed to a number. See below. |
| `Deposit Paid` | deposit amount | |
| `Deposit Received` | deposit paid | |
| `Done` | status Completed | |
| `Phone Number` | customer phone | Normalised to `01xxxxxxxxx` |
| `Venue` | venue | |
| `Event Type` | event type | |
| `Notes` | notes | |

**Never touched by the site**, because they are yours and it has no opinion about them:
`Location`, `Photo Completed`, `Guesbook Type`, `PhotoBooth`, `360 Photo Booth`,
`Guestbook`, `Audio Guestbook`, `Plinker`.

### `Time`

Read exactly as you write it. Every one of these is a real value from your database and
all nine are covered by tests:

| You wrote | Site reads |
| --- | --- |
| `7 to 12` | 19:00, 5 hours |
| `6 to 12` | 18:00, 6 hours |
| `6 to 10` | 18:00, 4 hours |
| `5 to 8` | 17:00, 3 hours |
| `3 to 5:30` | 15:00, 2.5 hours |
| `6` | 18:00, hours unknown |
| `3 hours` | 3 hours, start unknown |

A bare hour from 1 to 11 is read as the **evening**, because that is what an Egyptian
wedding means by "7". The site writes back in the same style: a booking at 20:00 for four
hours is written `8 to 12`, not `20:00 to 00:00`.

Anything it cannot read leaves the site's existing value alone rather than guessing.

### `Package Price`

A select whose six options are spelled six ways: `1500`, `2000EGP`, `3700EGP`,
`2999 EGP`, `4000 EGP`, `3500 EGP`. The site reads the digits out of whichever is set, so
all six work. When it writes, it uses `NNNN EGP`, and Notion creates the option if it is
new. Over time the spellings converge; nothing forces you to tidy them.

---

## 3. The integration token

**The Claude connector is not this.** The Notion connection in Claude is a session that
authenticates as you. The deployed website cannot use it, and it will not exist when a
cron job runs at two in the morning. The site needs its own internal integration.

1. Go to <https://www.notion.so/my-integrations> and press **New integration**.
2. Name it `QLTY site`. Pick the workspace **Modern Sciences and Arts University**.
3. Under **Capabilities**, tick **Read content**, **Update content** and **Insert
   content**. Leave user information unticked: the site never needs to know who edited a
   row.
4. Copy the **Internal Integration Secret**, which starts `ntn_`.

Set it as `NOTION_TOKEN`, locally in `.env` and on Vercel for production.

> This token can read and rewrite every booking, including customer names and phone
> numbers. It must never carry the `NEXT_PUBLIC_` prefix, which would compile it into the
> JavaScript every visitor downloads.

### Share the database with it

Open **🗓️ Bookings** as a full page. Press **•••** at the top right → **Connections** →
**Connect to** → `QLTY site`.

Nothing works until this is done, and the error when it is missing says the page does not
exist rather than that it is not shared, which is a confusing half hour.

### The data source id

Already known, and already in this document:

```
NOTION_BOOTH_DATA_SOURCE_ID=af2cfb8d-b3a5-4735-a717-69b915ff5d51
```

> This is a **data source** id, not a database id. Notion split the two in API version
> 2025-09-03: a database is a container and the rows live in a data source. Pasting the
> database id (`babf466f…`) fails with a message about the parent rather than about the
> version, which is the single most common way to wire this up wrong.

---

## 4. Import what is already there

```bash
npm run notion:import
```

Pulls your 26 existing bookings into Firestore. Do this **before** the booth page is
advertised, or the public calendar will cheerfully sell dates that are already sold.

What to expect:

- Rows with `Done` ticked become **Completed**. They are in the past and hold nothing.
- Rows with `Deposit Received` ticked become **Confirmed** and hold their date.
- Rows with **neither** ticked but a customer name — Gamal & yassmin, Malak & ahmed,
  Myrna & yasser — also become **Confirmed** and hold their date. They are commitments
  you have made, and the website must not resell those nights. `Deposit Paid` still
  records the truth about the money, separately.
- The two empty rows become **Blocked** and are harmless.
- Each row gets a `Booking ID` written back into Notion.

Safe to run more than once: rows are matched on their Notion page id first and their
booking id second, so a second run updates rather than duplicating.

**Importing does not report anything to Meta.** Only the admin's own Confirm button
raises a Purchase, which is what stops six months of history becoming twenty six
conversions on a Tuesday afternoon.

---

## 5. The webhook

This is what makes a Notion edit reach the site within a minute instead of within
fifteen. **It cannot be created from Claude** — see the note at the end of this document.

1. Deploy first. The URL has to be reachable, so this cannot be done against localhost.
2. In your integration's settings page, open the **Webhooks** tab → **Create a
   subscription**.
3. URL: `https://qlty.events/api/notion/webhook`
4. Subscribe to: **page.created**, **page.properties_updated**, **page.deleted**,
   **page.undeleted**, **page.moved**.
5. Press create. Notion immediately posts a one time verification token and waits.
6. Find it in the Vercel logs:
   `[notion/webhook] verification token received. Paste this into Notion ...`
7. Paste it into the Notion form to verify the subscription.
8. Set the same value as `NOTION_WEBHOOK_SECRET` in Vercel, and redeploy.

Step 8 is not optional. Until that variable is set the endpoint refuses every request
with a 503, because an unverified webhook is an open endpoint that makes the site read
and write Notion on our token.

---

## 6. The scheduled catch up

Webhooks are best effort: Notion aggregates them, drops some and delivers others late.
Two scheduled jobs cover that, and both are already committed.

**Every fifteen minutes** by GitHub Actions (`.github/workflows/booth-sync.yml`). Add two
repository secrets under Settings → Secrets and variables → Actions:

- `CRON_SECRET` — the same value as in Vercel
- `SITE_URL` — `https://qlty.events`

**Once a night** by Vercel cron (`vercel.json`), running the full pass.

```bash
openssl rand -base64 32
```

for `CRON_SECRET`. The Vercel value and the GitHub value must match.

A third trigger needs no setup: loading the booth calendar when the last sync is over
five minutes old starts one in the background.

---

## How it behaves once it is running

**A row you type by hand with no `Booking ID`.** Valid, and the normal way to record a
phone booking or block a week. The site assigns a booking id and writes it back. A row
with a name becomes Confirmed and holds the date; one without becomes Blocked.

**A row with no `Date`.** Ignored, not an error. Somebody is part way through typing.

**Both sides edited.** Whoever edited last wins, comparing Notion's `last_edited_time`
against the booking's own timestamp with a minute of slack. The losing version is written
to a `history` subcollection rather than discarded, so "I changed it in Notion and it
changed back" is an answerable question.

**A row deleted or moved to the trash.** The booking is **cancelled**, never deleted, and
the date goes back on sale. A booking is a commitment to a person, and a row that
vanished because somebody tidied a view is not evidence the commitment ended.

**An echo.** Every write the site makes comes straight back as a webhook. The site stores
a hash of what it sent; a page that hashes to the same value is its own write returning
and is dropped. Without this the two systems would write to each other until something
rate limited.

---

## Why Claude cannot create the webhook

The Notion connector in Claude authenticates **as you, in a chat session**. It can read
and write pages, databases and schemas, which is how the three properties above were
added. It has no tool for managing integrations, and webhook subscriptions are not pages:
they belong to an *integration*, are created in the integration settings dashboard, and
Notion exposes no public API for creating one.

The verification handshake also requires the deployed endpoint to be live and its logs
readable, which is a step only somebody with the Vercel dashboard can complete.

So section 5 is manual. It is about five minutes.

---

## When it goes wrong

The admin at `admin.qlty.events/admin/booth/settings` shows the last sync, the last
webhook, the last error and a count of bookings whose sync failed. **Sync with Notion
now** runs one on demand and waits for it.

| What you see | Usually means |
| --- | --- |
| Every booking `error`, message mentions the parent | `NOTION_BOOTH_DATA_SOURCE_ID` holds the database id. Use `af2cfb8d-…` |
| `Could not find page` on everything | The database was never shared with the integration |
| Webhook never fires, scheduled sync works | The subscription was created but never verified, or `NOTION_WEBHOOK_SECRET` is unset |
| A booking's price reads as 0 | Its `Package Price` is empty, or holds text with no digits |
| A booking's time is missing | Its `Time` could not be parsed. The site left its own value alone rather than guessing |
| Nothing syncs, admin says not configured | `NOTION_TOKEN` is missing from the environment the site actually runs in |
