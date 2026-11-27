# 4. Documentation site and playground

Status: accepted

## Decision

`apps/docs` is a Next.js App Router site with Tailwind, exported as static files.
The reference and error code pages render `docs/*.md` at build time. The
playground runs `core` in a Web Worker with a step budget, an output cap and a
5 second timeout. The editor and highlighter use the `core` lexer, with no editor
library.

Mithu the parrot is inline SVG animated with CSS. Its chirps are short parts of
one public domain recording, `apps/docs/public/sounds/budgerigar-chirping.ogg`;
its other sounds, and the chirps where that file cannot play, are synthesised
with Web Audio. Neither adds a dependency. Sound is soft by
default, starts only after a click or key press, and the header button cycles it
through soft, loud and off.

Fonts are Inter and JetBrains Mono, with Noto Sans Devanagari, in two weights, downloaded at build time by `next/font` and
served from the site itself.

## Consequences

Building needs network access for the fonts, and `core` must be built first,
which the workspace order guarantees. `apps/docs/lib/content/status.ts` must be updated
when the language gains features.
