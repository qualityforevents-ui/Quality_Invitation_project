# Setup runbook

Do these in order. Everything up to and including step 5 has to be done once before the
app will run at all. Steps 6 onward can wait.

---

## 1. Supabase project

1. Create a new project at [supabase.com](https://supabase.com).
2. **Region: Frankfurt (eu-central-1).** Egypt to Frankfurt is a much shorter trip than
   Egypt to any US region, and this choice cannot be changed later without recreating
   the project.
3. Save the database password somewhere safe. Supabase shows it once.

### Get the two connection strings

In the dashboard go to **Project Settings, Database, Connection string**.

You need both of these:

- **Transaction pooler, port 6543.** This is `DATABASE_URL`. Every query the running app
  makes goes through it. Each Vercel serverless invocation opens its own connection, and
  the direct connection limit is reached quickly under load, which is the whole reason
  the pooler exists.
- **Direct connection, port 5432.** This is `DIRECT_URL`. Migrations only. Migrations
  issue statements a transaction pooler cannot carry, so they need the direct route.

> **If the direct host does not resolve,** which is normal on projects created recently,
> use the **session pooler** as `DIRECT_URL` instead: same pooler hostname, port 5432.
> Supabase now gives new projects an IPv6 only direct address, so `db.<ref>.supabase.co`
> simply has no IPv4 record and fails with a name resolution error rather than anything
> that hints at the real cause. The session pooler holds one connection per client for
> its whole session, which is what migrations need.

### Passwords with punctuation in them

The password is embedded in both URLs, so any of `@ ? & + # / : %` inside it has to be
percent encoded or the string is malformed. An unescaped `@` is the nastiest: the parser
treats everything after it as the hostname, and you get a "host not found" error that
sends you looking at DNS instead of at your password.

There is a helper for this. It runs locally, so the password never leaves your machine:

```sh
node scripts/encode-db-url.mjs "postgresql://postgres.abc:my@pass?word@host:6543/postgres"
```

It prints the encoded URL, ready to paste into `.env`. Use it again whenever you rotate
the password.

Append `?pgbouncer=true&connection_limit=1` to `DATABASE_URL` as Supabase suggests. The
app strips those two parameters before handing the string to the Postgres driver, so it
works whether or not they are there.

### Disable public signup

**Authentication, Sign In and Providers, Email.** There are two controls here and they
do different things. Getting them the wrong way round locks you out of your own admin:

| Control | Set it to | What it controls |
|---|---|---|
| **Enable Email provider** | **ON** | Whether email and password sign in works at all |
| **Allow new users to sign up** | **OFF** | Whether strangers can create accounts |

Turn off the second one only. Switching off the provider disables sign in for the
operator as well, and the login screen then reports the same thing it reports for a
wrong password, so it is a slow one to diagnose.

The only account that should ever exist is the operator's. Leaving signup on means anyone
who finds the admin URL can create themselves an account. Do this now, before the admin
exists, so it is not forgotten later.

### Create the operator account

**Authentication, Users, Add user.** Tick **Auto Confirm User**.

That box is unticked by default, and without it the account is created but cannot sign
in until the address is confirmed. There is no real mailbox behind an operator address,
so the confirmation email never arrives and the account is unusable. With signup
disabled, this dialog is the only way an account gets created from here on.

---

## 2. Environment variables

```sh
cp .env.example .env
```

Fill in `DATABASE_URL` and `DIRECT_URL` from step 1.

Generate the cron secret:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Set `NEXT_PUBLIC_INSTAPAY_ADDRESS` and `NEXT_PUBLIC_INSTAPAY_NAME` to the real recipient
details. Customers copy these straight into their banking app, so a typo here is a
misdirected transfer, not a cosmetic bug. Check them character by character.

---

## 3. Create the tables

```sh
npm run db:migrate
```

This reads `DIRECT_URL` from `prisma.config.ts` and applies the schema. On a fresh
project it will ask for a migration name. `init` is fine.

Confirm it worked:

```sh
npm run db:studio
```

You should see an empty `Invitation` table and an empty `Heartbeat` table.

---

## 4. Run it locally

```sh
npm run dev
```

Then open `http://localhost:3000` on your phone over the same network, using your
machine's local IP rather than localhost. Testing on a real phone is the point, and
several things in this app behave differently there than in a desktop browser.

---

## 5. Deploy to Vercel

1. Import the project.
2. Add every variable from your `.env` to the Vercel project settings.
3. `vercel.json` already pins functions to `fra1`. Leave it that way, matching the
   Supabase region. Serving from a US region makes every query cross the Atlantic twice.

### The daily cron

`vercel.json` registers `/api/cron/heartbeat` to run once a day at 04:00 UTC.

A free Supabase project **pauses after seven days with no database activity**, and a
paused project takes live invitations down with it. The cron writes one row a day, which
is enough to keep it awake. Vercel Hobby allows exactly one cron per day, which is
exactly what this needs.

Set `CRON_SECRET` in the Vercel environment. Vercel then sends it as a bearer token and
the route rejects anything else.

Verify after the first deploy:

```sh
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://qlty.events/api/cron/heartbeat
```

You should get `{"ok":true,...}` with a count that goes up each time.

---

## 6. Backups

**The free Supabase plan has no backups.** This table holds wedding dates and customer
phone numbers. Losing it is not something you recover from by apologising.

Run one now:

```sh
npm run backup
```

That writes every row to `backups/qlty-backup-YYYYMMDD-HHMM.json`. The `backups` folder
is excluded from version control.

### Scheduling it

The daily Vercel cron slot is taken by the heartbeat, and a Vercel function has nowhere
durable to write anyway. So the schedule has to live somewhere you control. Two options
that work:

**Windows Task Scheduler, on your own machine.** Create a daily task that runs:

```
cmd /c cd /d "C:\Users\Mega Store\Desktop\quality\invitation app" && npm run backup
```

Simple, and the file lands on a disk you own. It only runs when the machine is on.

**A scheduled job on a service you already pay for**, running the same command against
`DIRECT_URL`. More reliable, more setup.

Either way: **copy the output off the machine that made it.** A backup sitting on the
same laptop as everything else is not a backup. Point a cloud sync folder at `backups/`
and the problem is solved.

For a full schema and data dump rather than a row export, with Postgres client tools
installed:

```sh
pg_dump "$DIRECT_URL" -Fc -f backups/full.dump
```

---

## 7. ImageKit

Not needed until photo upload is built. When you get there:

1. Create a free account. Note the limits: **20 GB bandwidth per month, 3 GB storage.**
   Bandwidth resets monthly, storage does not.
2. Copy the URL endpoint, public key, and private key into `.env`.
3. **Set a bandwidth alert well below the cap.** On the free plan delivery *stops* at the
   limit rather than slowing down, which would take the photos off every live invitation
   in the middle of somebody's wedding.

---

## 8. Music files

Eight tracks go in `public/music`. They are not in the repo. See
[public/music/README.md](public/music/README.md) for the exact filenames, the encoding
budget, and the ffmpeg command that satisfies it.

Check what is present at any time:

```sh
npm run check:music
```

Until the files are there, invitations open silently and the mute toggle hides itself.
Nothing breaks.

---

## Reference: what runs where

| Concern | Value |
|---|---|
| Runtime queries | `DATABASE_URL`, pooler, port 6543, pool capped at one connection |
| Migrations | `DIRECT_URL`, direct, port 5432, read from `prisma.config.ts` |
| Vercel functions | `fra1`, pinned in `vercel.json` |
| Supabase | Frankfurt, `eu-central-1` |
| Cron | `/api/cron/heartbeat`, daily, bearer token |
