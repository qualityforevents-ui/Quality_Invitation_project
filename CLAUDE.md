@AGENTS.md

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Meta pixel and Conversions API

Every customer facing surface reports to Meta from both halves — the browser pixel and
the server side Conversions API — under the same event id, so the pair counts as one
conversion. See `src/lib/meta/` and the README section of the same name.

Rules when adding anything:

- **A new page inside `src/app/(site)/` needs nothing.** It inherits `<MetaPixel />` from
  that layout. A new customer facing page *outside* that group must render `<MetaPixel />`
  itself, the way `/sample` does, or it reports nothing at all.
- **Do not add the pixel to `/[slug]`.** Those are wedding guests, not customers.
  Tracking them poisons lookalike audiences and retargeting. The route group boundary is
  the tracking boundary, on purpose.
- **Never call `fbq` directly.** Use `metaTrack` from `src/lib/meta/pixel.ts`. A direct
  call fires a browser event the server never mirrors, which is invisible until the
  numbers are wrong.
- **New event names go in `src/lib/meta/events.ts` first.** The API route that mirrors
  events to the Conversions API allowlists against that file and silently drops anything
  else.
- **A new builder question is picked up automatically** by `useFlowTracking` from
  `SECTION_ORDER`. A new interaction worth measuring needs its own `metaTrack` call.
- **Every event carries `content_category`** (`invitation`, `photobooth` or `home`), and
  `metaTrack` requires it in its type, so a new call site cannot forget. The two products
  are priced an order of magnitude apart and an unlabelled event cannot be split out
  later.
- **`Purchase` is server side only**, raised from `activateInvitation`. Payment is settled
  by a human on WhatsApp, so nothing in a browser can know money arrived.
- **Once-per-visit guards must use sessionStorage, not refs.** The builder remounts when
  the draft is created; refs reset and the event fires twice.

## Photo booth and Notion

The booth is the second product. Its rules are different from the invitations' in ways
that are easy to violate by analogy.

- **Dates are Cairo calendar days as `"YYYY-MM-DD"` strings, never Timestamps.** A booth
  booking is a day, not an instant. See the note on `BoothReservation.eventDate` in
  `src/lib/types.ts`. Day arithmetic is in `src/lib/photobooth/availability.ts` and is
  done in UTC deliberately, because Egypt observes daylight saving.
- **Never write a booth status or date straight onto a document.** Go through
  `createReservation`, `holdReservation` or `updateReservation` in
  `src/lib/photobooth/reservations.ts`. They run the transaction that recounts the day,
  which is the only thing stopping two customers taking the last booth at once. Run
  `npm run check:booth` after changing anything in there.
- **`REQUESTED` holds no unit.** Only `HELD`, `CONFIRMED` and `BLOCKED` occupy a booth. A
  form submission is not a reason to close a Saturday.
- **The public availability path must not need a composite Firestore index.** An
  undeployed composite index is a 503 on the page the business advertises. Admin queries
  may use them; the customer path may not.
- **Every write that changes availability calls `revalidateBoothAvailability()`** from
  `src/lib/photobooth/cache.ts`, or the calendar keeps serving a date that has been sold.
- **Notion pushes go in `after()`**, never inline. A Notion outage must not fail an
  operator's tap or a customer's booking. A failed push leaves `syncState: 'error'` and
  the reconcile job retries it.
- **The Notion API version is pinned** in `NOTION_VERSION` in `src/lib/notion/client.ts`.
  Moving it is a deliberate act with a read of the changelog behind it. The property
  names in `src/lib/notion/booth-schema.ts` are a contract with a database a human edits
  by hand; renaming one breaks the sync with nothing to catch it at build time.
- **`syncHash` is the loop guard.** Every write to Notion echoes back as a webhook.
  Anything added to what is synced must go into `syncHashOf`, or that field will ping
  back and forth between the two systems forever.
- **Placeholders.** `BOOTH_CONFIG_IS_PLACEHOLDER` in `src/lib/photobooth/config.ts` is
  still `true`: the prices, packages, areas and every image path are invented. See
  `docs/BOOTH-INPUTS.md`. Do not quietly treat them as real.

## Checks

`npm run typecheck` runs with `--incremental false` on purpose. A stale
`tsconfig.tsbuildinfo` once made `tsc --noEmit` report success on a tree with twelve real
type errors in it. Do not remove the flag.

`npm test` runs the pure unit tests on Node's built in runner: the availability rules,
the Notion webhook signature and the sync hash. `npm run check:booth` exercises the
concurrency guarantee against a real Firestore, because what it proves is a property of
the database rather than of any function here.
