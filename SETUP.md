# Setup runbook

Do these in order. Everything up to and including step 5 has to be done once before the
app will run at all. Steps 6 onward can wait.

---

## 1. Firebase project

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Create a Firestore database. **Location: `eur3` (Europe).** Egypt to Europe is a much
   shorter trip than Egypt to any US region, and this cannot be changed later without
   recreating the database.
3. Enable **Authentication, Sign-in method, Email/Password**. Leave sign-up closed —
   there is exactly one operator account and no public registration.
4. Under **Authentication, Users**, add the operator account by hand.

### Get the credentials

**Project settings, Service accounts, Generate new private key.** That downloads a JSON
file. Three values out of it go into the environment:

| From the JSON | Environment variable |
|---|---|
| `project_id` | `FIREBASE_PROJECT_ID` |
| `client_email` | `FIREBASE_CLIENT_EMAIL` |
| `private_key` | `FIREBASE_PRIVATE_KEY` |

Keep the quotes around the private key. It contains newlines, which travel through an
environment variable as literal `\n`, and `src/lib/db.ts` converts them back.

**Project settings, General, Web API Key** goes into `FIREBASE_WEB_API_KEY`. It is used
only to check the operator's password at sign in and grants nothing on its own.

Treat the service account JSON as the keys to the business. It bypasses Firestore
security rules completely, which is exactly why the rules in `firestore.rules` deny
everything: no browser ever talks to Firestore, only the server does.

---

## 2. Environment variables

```sh
cp .env.example .env
```

Fill in the four `FIREBASE_*` values from step 1.

Set `NEXT_PUBLIC_INSTAPAY_ADDRESS` and `NEXT_PUBLIC_INSTAPAY_NAME` to the real recipient
details. Customers copy these straight into their banking app, so a typo here is a
misdirected transfer, not a cosmetic bug. Check them character by character.

---

## 3. Indexes

There are no tables to create and no migrations to run. Firestore makes a collection the
first time something is written to it.

What it does need is the two composite indexes the admin lists sort by, which are
declared in `firestore.indexes.json`:

```sh
firebase deploy --only firestore
```

That deploys the indexes and the security rules together. If a query ever fails with a
"requires an index" error, the message contains a link that creates it — add it to
`firestore.indexes.json` afterwards so it is not lost the next time the project is set up.

---

## 4. Run it locally

Local development runs against the Firestore emulator, so no service account key has to
sit on a developer's machine and nothing you do locally can touch real customer data:

```sh
firebase emulators:start --only firestore
```

With `FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"` set in `.env`, the Admin SDK talks to
localhost and never authenticates. Comment that line out to point at the real project.

```sh
npm run dev
```

Then open `http://localhost:3000` on your phone over the same network, using your
machine's local IP rather than localhost. Testing on a real phone is the point, and
several things in this app behave differently there than in a desktop browser.

---

## 5. Deploy to Vercel

1. Import the project.
2. Add every variable from your `.env` to the Vercel project settings, except
   `FIRESTORE_EMULATOR_HOST` — setting that in production would point the live site at a
   database that does not exist.
3. `vercel.json` already pins functions to `fra1`. Leave it that way, matching the
   Firestore location. Serving from a US region makes every query cross the Atlantic twice.

## 6. Backups

**The Firestore free tier has no scheduled export.** These documents hold wedding dates
and customer phone numbers. Losing them is not something you recover from by apologising.

Run one now:

```sh
npm run backup
```

That writes every invitation and review to `backups/qlty-backup-YYYYMMDD-HHMM.json`,
with Timestamps rendered as ISO strings so the file can be read and restored without the
Admin SDK. The `backups` folder is excluded from version control.

### Scheduling it

A Vercel function has nowhere
durable to write anyway. So the schedule has to live somewhere you control. Two options
that work:

**Windows Task Scheduler, on your own machine.** Create a daily task that runs:

```
cmd /c cd /d "C:\Users\Mega Store\Desktop\quality\invitation app" && npm run backup
```

Simple, and the file lands on a disk you own. It only runs when the machine is on.

**A scheduled job on a service you already pay for**, running the same command with the
service account credentials in its environment. More reliable, more setup.

Either way: **copy the output off the machine that made it.** A backup sitting on the
same laptop as everything else is not a backup. Point a cloud sync folder at `backups/`
and the problem is solved.

For a managed export rather than a JSON file, Firestore can write straight to a Cloud
Storage bucket. It needs billing enabled on the project, which the free tier does not
have:

```sh
gcloud firestore export gs://YOUR_BUCKET --project qlty-invitations
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
| Database | Firestore, `eur3`, reached with the Admin SDK over HTTPS |
| Credentials | Service account, three `FIREBASE_*` variables |
| Local database | Firestore emulator, `FIRESTORE_EMULATOR_HOST` |
| Indexes and rules | `firestore.indexes.json`, `firestore.rules`, `firebase deploy --only firestore` |
| Admin login | Firebase Auth, one account, session cookie for two weeks |
| Vercel functions | `fra1`, pinned in `vercel.json` |
