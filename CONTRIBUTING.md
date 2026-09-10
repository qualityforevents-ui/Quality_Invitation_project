# Working on this together

Three people, one small codebase, one shared database. This is what to know before
touching anything.

---

## Getting set up

```sh
git clone https://github.com/qualityforevents-ui/Quality_Invitation_project.git
cd Quality_Invitation_project
npm install
```

Then you need a `.env`, and **it is not in the repository and never will be**. It holds a
live database password and the ImageKit private key. Ask the project owner to send you
the values through a password manager or an encrypted message, not over WhatsApp and not
in a chat window.

Copy `.env.example` to `.env`, fill in what you were given, and check it works:

```sh
npm run dev
```

`SETUP.md` explains where every value comes from if you need the background.

---

## The database. Three rules.

Local development runs against the Firestore emulator, so nothing you do on your own
machine touches customer data. Comment out `FIRESTORE_EMULATOR_HOST` in `.env` and you
are pointing at the live project all three of you share, where every write is visible to
everyone else immediately.

**1. Firestore has no migrations, and that is the trap.** There is no schema to alter and
no migration to run, so a shape change never fails loudly the way a missing column does.
Add a field to `InvitationRecord` and every document already written is simply without
it. Read new fields back as optional and default them rather than assuming they are
there.

**2. `src/lib/types.ts` is hand written.** Nothing generates it, because Firestore has
nothing to generate from. It is the only description of document shape that exists, so it
is accurate only for as long as you keep it accurate. Update it in the same commit as the
code that writes the new field.

**3. Test invitations pile up.** Everything you build shows in the admin's pending list
alongside real customers. Give test couples obviously fake names so nobody activates one
by accident.

---

## Branches

Nobody commits to `main` directly once there is more than one of you.

```sh
git checkout -b photo-crop-fix   # short, describes the change
# work, then
git add -A
git commit -m "Fix crop being lost when returning to the theme step"
git push -u origin photo-crop-fix
```

Then open a pull request on GitHub and have someone else read it. On a team this size the
review is less about catching mistakes and more about two people knowing how each part
works.

Before you push, always:

```sh
npm run typecheck
npm run build
```

A build that fails on `main` blocks everyone.

---

## Testing on a phone is not optional

Over ninety five percent of traffic is phones, and this project has already produced five
bugs that were invisible on a desktop and obvious on an iPhone within a minute. Among
them: a cookie that browsers silently discarded, autosave losing the last thing you
typed, and a timezone mismatch that stripped every button of its click handler for three
hours each evening.

**Test against a production build, not the dev server:**

```sh
npm run build
npm start
```

Then open `http://<your-machine-ip>:3000` on your phone, on the same wifi.

The dev server regenerates its JavaScript filenames on every file change. A phone has no
hot reload connection, so it requests chunks that have already been replaced, gets a 404,
and the page renders with every button dead. It looks like a catastrophic bug and it is
an artefact of the dev server. Do not waste an afternoon on it as we did.

---

## Things that will bite you

These are written up in full in `README.md` under "Things that will bite if you forget
them". The short version:

- **No double hyphens in customer facing text.** Commas or separate sentences instead.
- **Audio needs a tap.** The play call must stay synchronous inside the open handler or
  Safari refuses it.
- **Never force a text direction onto a string containing Arabic words.** It reorders
  them. `<bdi>` isolates a Latin run without breaking alignment.
- **Theme colours must go through `@theme inline`.** A plain `@theme` block resolves at
  build time and every theme silently renders the classic palette.
- **Never type an Arabic diacritic range into a regex literally.** Use `\u` escapes. Those
  characters are invisible in an editor and a careless range swallows every Arabic letter.

---

## Who can reach what

| | Needs |
|---|---|
| The code | GitHub collaborator access |
| The database and admin | Firebase console access, or just the `.env` values |
| Photo storage | ImageKit dashboard access, or just the `.env` values |
| Live deployment | Vercel project access |

The admin has exactly one operator account and public signup is disabled. If a teammate
needs their own admin login, the owner creates it from the Firebase console under
Authentication, Users, Add user. The console can create accounts even with signup
disabled; that is the point of disabling it.
