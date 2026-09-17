# Notion booth sync: setting it up

The booth bookings live in Firestore and are mirrored into a Notion database, in both
directions. Edit a booking in the admin and Notion updates; drag a date in Notion and
the site's calendar updates.

This document is the setup. It takes about twenty minutes and needs a Notion workspace
you own.

> The property names below are a contract, not a suggestion. The site reads and writes
> the exact names in `src/lib/notion/booth-schema.ts`. Renaming a column in Notion
> breaks the sync in a way nothing will catch at build time. If this document and that
> file ever disagree, **the file is right and this document is stale**.

---

## 1. Create the database

In Notion, create a new full page database. Call it whatever you like, for example
**QLTY booth bookings**. The name is never read by the site.

Add these properties. Delete the default `Tags` property; keep `Name`.

| Property       | Type      | Options                                                        |
| -------------- | --------- | -------------------------------------------------------------- |
| `Name`         | Title     | already exists. Holds the customer name, or `Blocked`            |
| `Booking ID`   | Text      |                                                                  |
| `Status`       | Select    | `Requested`, `Held`, `Confirmed`, `Completed`, `Cancelled`, `Blocked` |
| `Event date`   | Date      | date only, **leave the time switch off**                         |
| `Start time`   | Text      | e.g. `20:00`                                                     |
| `Hours`        | Number    |                                                                  |
| `Units`        | Number    | how many booths this booking takes. Usually 1                    |
| `Package`      | Select    | `ESSENTIAL`, `FULL_NIGHT`, `SIGNATURE`                           |
| `Price`        | Number    | set the format to Number, not Egyptian pound, or Notion rounds   |
| `Deposit`      | Number    |                                                                  |
| `Deposit paid` | Checkbox  |                                                                  |
| `Phone`        | Phone     |                                                                  |
| `Venue`        | Text      |                                                                  |
| `Area`         | Select    | `CAIRO`, `GIZA`, `OTHER`                                         |
| `Event type`   | Select    | `WEDDING`, `ENGAGEMENT`, `KATB_KETAB`, `BIRTHDAY`, `CORPORATE`, `OTHER` |
| `Notes`        | Text      |                                                                  |
| `Source`       | Select    | `Site`, `Admin`, `Notion`                                        |
| `Admin link`   | URL       | written by the site, never edit it                               |
| `Last synced`  | Date      | written by the site, never edit it                               |

Notion creates select options on first use, so you do not have to type them all in
advance. Doing so is still worth it: it stops a typo becoming a new option, and an
option the site does not recognise is ignored rather than guessed at.

**The `Package`, `Area` and `Event type` options are the site's internal constants, in
capitals with underscores.** They look unfriendly in Notion and that is deliberate: they
have to match `src/lib/photobooth/config.ts` exactly, and a friendlier label would be a
second thing to keep in step.

---

## 2. Create the integration

1. Go to <https://www.notion.so/my-integrations> and press **New integration**.
2. Name it `QLTY site`. Pick the workspace with the booth database in it.
3. Under **Capabilities**, tick **Read content**, **Update content** and **Insert
   content**. Leave user information unticked: the site never needs to know who edited
   a row.
4. Copy the **Internal Integration Secret**. It starts with `ntn_`.

Set it as `NOTION_TOKEN`, locally in `.env` and on Vercel for production.

> This token can read and rewrite every booking, including customer names and phone
> numbers. It must never be given the `NEXT_PUBLIC_` prefix, which would compile it into
> the JavaScript every visitor downloads.

---

## 3. Share the database with the integration

Open the database as a full page. Press the **...** menu at the top right,
**Connections**, then **Connect to**, and choose `QLTY site`.

Nothing works until this is done, and the error when it is missing says the page does
not exist rather than that it is not shared, which is a confusing half hour.

---

## 4. Find the data source id

This is the step that catches people out. In September 2025 Notion split **databases**
from **data sources**: a database is now a container that can hold more than one data
source, and the rows live in the data source. The site needs the **data source id**, not
the database id, and pasting the wrong one fails with a message about the parent rather
than a message about the version.

The database id is the part of the page URL before the `?`:

```
https://www.notion.so/your-workspace/1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c?v=...
                                     ^-------------- database id --------^
```

Ask Notion for the data sources inside it, with the token from step 2:

```bash
curl -s 'https://api.notion.com/v1/databases/PASTE_DATABASE_ID_HERE' \
  -H 'Authorization: Bearer ntn_PASTE_TOKEN_HERE' \
  -H 'Notion-Version: 2025-09-03' | grep -o '"data_sources":.*'
```

The response carries a `data_sources` array. Take the `id` of the first entry.

Set it as `NOTION_BOOTH_DATA_SOURCE_ID`.

> `2025-09-03` in that command is the version the site pins, in `NOTION_VERSION` in
> `src/lib/notion/client.ts`. Use the same one here, or you may get an older shape of
> response that has no data sources in it at all.

---

## 5. Import what is already there

If the database already has bookings in it, pull them in before the site starts taking
new ones. Otherwise the public calendar will happily sell dates that are already booked.

```bash
npm run notion:import
```

It prints a line per page and a summary. Safe to run more than once: pages are matched
on their Notion id first and their booking id second, so a second run updates rather
than duplicating.

---

## 6. The webhook

This is what makes a Notion edit reach the site within a minute instead of within
fifteen.

1. Deploy first. The webhook URL has to be reachable, so this step cannot be done
   against localhost.
2. In your integration's settings page, open the **Webhooks** tab and press **Create a
   subscription**.
3. URL: `https://qlty.events/api/notion/webhook`
4. Subscribe to these events: **page.created**, **page.properties_updated**,
   **page.deleted**, **page.undeleted**, **page.moved**.
5. Press create. Notion immediately sends a one time request containing a verification
   token, and waits.
6. Find that token in the Vercel logs for the deployment. The endpoint logs it as:
   `[notion/webhook] verification token received. Paste this into Notion ...`
7. Paste it into the Notion form to verify the subscription.
8. Set the same value as `NOTION_WEBHOOK_SECRET` in the Vercel environment, and
   redeploy.

Step 8 is not optional. Until that variable is set the endpoint refuses every request
with a 503, because an unverified webhook is an open endpoint that makes the site read
and write Notion on our token.

---

## 7. The scheduled catch up

Webhooks are best effort: Notion aggregates them, drops some and delivers others late.
Two scheduled jobs cover that.

**Every fifteen minutes**, by GitHub Actions, already committed at
`.github/workflows/booth-sync.yml`. Add two repository secrets under Settings, Secrets
and variables, Actions:

- `CRON_SECRET` — the same value as the Vercel environment variable
- `SITE_URL` — `https://qlty.events`

**Once a night**, by Vercel cron, already committed in `vercel.json`. This one runs the
full pass, which ignores the cursor and walks everything.

Generate the shared secret with:

```bash
openssl rand -base64 32
```

Set it as `CRON_SECRET` on Vercel and as the GitHub secret above. The two must match.

There is a third trigger that needs no setup: when somebody loads the booth calendar and
the last sync is more than five minutes old, the site starts one in the background. A
site with visitors largely keeps itself in step.

---

## How it behaves, once it is running

**A page created by hand, with no `Booking ID`.** Valid, and the normal way to record a
booking taken over the phone or to block out a week. The site assigns a booking id and
writes it back into the page. It defaults to `Blocked` rather than `Requested`, because
a row typed in by hand is usually something already true, and a status that did not hold
the date would let the website sell the same night.

**A page with no `Event date`.** Ignored, not an error. It is somebody part way through
typing.

**Both sides edited.** Whoever edited last wins, comparing Notion's `last_edited_time`
against the booking's own timestamp, with a minute of slack so two clocks a few hundred
milliseconds apart do not fight. The losing version is written to a `history`
subcollection on the booking rather than discarded, so "I changed it in Notion and it
changed back" is an answerable question.

**A page deleted or moved to the trash.** The booking is **cancelled**, never deleted,
and the date goes back on sale. A booking is a commitment to a person, and a row that
vanished because somebody tidied a view is not evidence the commitment ended.

**An echo.** Every write the site makes to Notion comes straight back as a webhook. The
site stores a hash of the fields it sent; an inbound page that hashes to the same value
is recognised as its own write returning and is dropped. Without this the two systems
would write to each other until something rate limited.

---

## When it goes wrong

The admin at `admin.qlty.events/admin/booth/settings` shows the last sync, the last
webhook, the last error, and a count of bookings whose sync failed. **Sync with Notion
now** runs one on demand and waits for it, so you see the result.

An individual booking shows a badge when it is not in sync. `pending` for a second or
two after an edit is normal; the push runs after the response. A booking stuck on
`pending`, or showing `error`, is the integration telling you something.

| What you see | Usually means |
| --- | --- |
| Every booking `error`, message mentions the parent | `NOTION_BOOTH_DATA_SOURCE_ID` holds a database id rather than a data source id. Redo step 4 |
| `Could not find page` on everything | The database was never shared with the integration. Step 3 |
| Webhook never fires, scheduled sync works | The subscription was created but never verified, or `NOTION_WEBHOOK_SECRET` is unset. Steps 6 and 8 |
| One booking `error`, others fine | Usually a select option in Notion that does not exist, for instance a `Package` that is not one of the three |
| Nothing syncs and the admin says not configured | `NOTION_TOKEN` is missing from the environment the site is actually running in |
