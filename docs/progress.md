# Progress

## Done

- Phase 0: workspaces, CI, ADRs, spec v0.1 draft, `NOTICE`.
- Phase 1: lexer, AST, parser with recovery, diagnostics and renderer, `check`.
- Phase 2: resolver, interpreter, `bolo`, `Host`, call-depth and step limits, `run`.
- Phase 3: lists, dictionaries on `Map`, index read and write, all built-ins.
- Phase 4: CLI (`run`, `check`, `--lang`, exit codes) and REPL.
- Phase 5: corpus migration, fuzz tests, long-string hardening,
  [baseline timings](baseline-timings.md).
- Phase 6: docs site and playground in `apps/docs`, with search,
  autocomplete and Hinglish errors. Not deployed.
- Phase 7: version 0.1.0, changelog and README. Tagged `v0.1.0`; not published
  to npm.
- Website in English and Hindi (Devanagari) under `/en` and `/hi`
  ([ADR 0005](decisions/0005-site-i18n.md)). Hindi text awaits review.

- UI/UX redesign on `feat/ui-ux`: new site layout and playground workbench,
  saved drafts, editor commands, error markers, and clearer CLI messages and
  REPL ([ADR 0006](decisions/0006-cli-presentation.md)). Not merged.
- Restructure on `refactor/structure` (builds on `feat/ui-ux`): website grouped
  by feature, Prettier, [architecture](architecture.md) and contributing guide.
  Not merged.

- Home page redesign on `feat/home-page` ([design notes](home-page-design.md)).
  Hindi text awaits review. Not merged.

## Next

- Release hygiene, playground, interpreter limits, CI and site polish.
- Deploy the site and get the Hindi text reviewed.

## Blockers

- Owner to confirm name, extension, CLI command and keyword spellings (needed
  before freezing).
- No licence chosen, so there is no `LICENSE` file yet.
