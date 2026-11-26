# Progress

## Done

- Phase 0: workspaces, CI, ADRs, spec v0.1 draft, `NOTICE`.
- Phase 1: lexer, AST, parser with recovery, diagnostics and renderer, `check`.
- Phase 2: resolver, interpreter, `bolo`, `Host`, call-depth and step limits, `run`.

## Next

- Phase 3: lists, dictionaries on `Map`, index read and write, remaining
  built-ins. Until then the interpreter throws `InternalError` on `List`, `Dict`
  and `Index`.

## Blockers

- Owner to confirm name, extension, CLI command and keyword spellings (needed
  before freezing).
- [Open questions](language-spec.md#open-questions) in the spec, needed for
  phase 3.
