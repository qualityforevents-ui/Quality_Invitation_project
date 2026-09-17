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
- **`Purchase` is server side only**, raised from `activateInvitation`. Payment is settled
  by a human on WhatsApp, so nothing in a browser can know money arrived.
- **Once-per-visit guards must use sessionStorage, not refs.** The builder remounts when
  the draft is created; refs reset and the event fires twice.
