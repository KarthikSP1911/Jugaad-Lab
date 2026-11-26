# Progress

## Done

- Phase 0: workspaces, CI, ADRs, spec v0.1 draft, `NOTICE`.
- Phase 1: lexer, AST, parser with recovery, diagnostics and renderer, `check`.

## Next

- Phase 2: resolver and interpreter (expressions, variables, blocks, control
  flow, functions, closures, `bolo`, `Host`, limits).
- Golden runner: add `.out` and runtime `.err` handling once `run` exists.

## Blockers

- Owner to confirm name, extension, CLI command and keyword spellings (needed
  before freezing).
- [Open questions](language-spec.md#open-questions) in the spec; division and
  remainder by zero is needed for phase 2.
