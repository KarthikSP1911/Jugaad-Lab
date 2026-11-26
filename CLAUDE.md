# CLAUDE.md — Jugaad Hinglish

A small, dynamically typed, lexically scoped programming language with Roman-script Hindi keywords, implemented as a TypeScript tree-walking interpreter. Design source: "Hinglish Programming Language: Technical Design Document" (derived from an audit of the KannadaScript repo). This file is the working context; read it fully before acting.

## Status and open decisions

- Greenfield. Nothing is implemented yet. Build in the phase order below.
- Placeholders to confirm with the owner before freezing: language name (working: Jugaad Hinglish), file extension (`.hing`), CLI command (`hinglish`), final keyword spellings.
- Licence: KannadaScript appears derived from BhaiLang (inferred from identifiers). Do NOT copy source from either. Write from this spec. Keep a `NOTICE` file for anything reused.

## Stack and constraints

- TypeScript (strict), current Node LTS, ESM. Vitest for tests. `tsup` for builds. npm or pnpm workspaces. No Turborepo at first.
- Pin all dependency versions. Commit the lockfile (never gitignore it).
- `packages/core` must not import Node APIs (it runs in the browser playground too).
- No global mutable state anywhere. Every run creates its own objects (re-entrant).
- Prefer zero runtime dependencies in `core`.

## Layout

```text
packages/core/src/   index.ts packs/hinglish.ts lexer/ ast/ parser/ resolver/ interpreter/ runtime/ diagnostics/
packages/core/test/  unit tests per stage
packages/cli/src/    main.ts host-node.ts repl.ts
apps/docs/           docs site + playground (Next.js)
tests/programs/      golden files: name.hing + name.out | name.err
examples/            hello.hing fizzbuzz.hing ...
docs/                language-spec.md error-codes.md architecture.md decisions/ (ADRs)
tools/migrate-ks.ts  one-off translator from KannadaScript samples
```

Dependency rule: apps and cli import core; core imports nothing outside itself (enforce with ESLint `no-restricted-imports`). One file per concept, kebab-case filenames.

## Pipeline

source -> Lexer -> `Token[]` -> Parser -> `Program` AST -> Resolver -> checked AST -> Interpreter -> Runtime. All stages report to one `Diagnostic` channel.

- **Lexer:** hand-written scanner, linear time, no regex per token, no slicing the remaining source. Keywords come from a `Map` in `packs/hinglish.ts` (aliases and a future Devanagari pack are extra entries). Token = `{kind, lexeme, start, end, line, column}`. Always end with `EOF`. Numbers are unsigned; `-` is always an operator. Strings: `"` or `'`, escapes `\n \t \\ \" \'`.
- **AST:** discriminated unions `Expr` and `Stmt`, `kind` + `span` on every node. `warna agar` is an `If` nested in `otherwise`.
- **Parser:** one `Parser` class, one method per grammar rule, precedence table for binary operators. Panic-mode recovery: record the diagnostic, skip to `;` or a statement keyword, continue, cap at 20 diagnostics. Assignment targets are `Var` or `Index`.
- **Resolver:** one walk with a scope stack. Records scope depth per `Var`. Checks (codes below). Functions are hoisted per block.
- **Interpreter:** `evaluate(expr, env)` and `execute(stmt, env)`; exhaustive `switch` on `kind`. Completion records `{type: normal|break|continue|return, value}`; no exceptions for `wapas`, no flags on scopes. Environment chain, closures capture the defining env. Short-circuit `&&` `||`. Non-boolean condition is an error. Call-depth limit (default 1000, error E0402, catch `RangeError` and convert) and optional step budget (`maxSteps`).
- **Runtime:** native JS values (`number`, `string`, `boolean`, `null`, `Array` for lists, `Map<string, Value>` for dictionaries, `HinglishFunction`, `NativeFunction`). Never use plain objects for dictionaries (prototype members leak). I/O only through a synchronous injected `Host { write(text): void; readLine(prompt): string }`. Never call `console.log` in core.
- **Public API:** `check(src, opts) -> {ast, diagnostics}`, `run(src, host, opts) -> RunResult`, `tokenize`, `parse`.

## Language summary

Single-word keywords only. No program wrapper. `;` required. Blocks use braces, conditions use parentheses.

| Concept | Keyword | Concept | Keyword |
| --- | --- | --- | --- |
| variable / constant | `rakho` / `pakka` | function / return | `kaam` / `wapas` |
| if / else | `agar` / `warna` (`warna agar` = two tokens) | true / false / null | `sach` / `jhooth` / `khaali` |
| while / counted loop | `jabtak` / `chalo (init; test; step)` | and / or / not | `aur` `ya` `nahi` (aliases of `&&` `\|\|` `!`) |
| break / continue | `ruko` / `agla` | | |

Built-ins (functions, not keywords): `bolo(...)` print with spaces and newline, `suno(prompt)`, `lambai(x)`, `joro(list, x)`, `nikalo(list)`, `sankhya(x)`, `shabd(x)`, `prakar(x)`.
`shabd` prints `sach`, `jhooth`, `khaali` for those values. `prakar` returns `sankhya|shabd|bool|khaali|soochi|kosh|kaam`.

Types: number (float64), string, boolean, null, list, dictionary (string keys), function (first-class, closures).
Semantics: `==` `!=` never coerce; `< <= > >=` take two numbers or two strings; `+` joins when either side is a string; conditions must be boolean; out-of-range index is a runtime error; undefined, duplicate, and constant misuse are compile-time errors.
Precedence low to high: assignment (right) < `|| ya` < `&& aur` < `== !=` < `< <= > >=` < `+ -` < `* / %` < unary `! nahi -` < call/index.

Grammar:

```text
program     = { declaration } EOF ;
declaration = varDecl | funcDecl | statement ;
varDecl     = ( "rakho" | "pakka" ) IDENT [ "=" expression ] ";" ;
funcDecl    = "kaam" IDENT "(" [ params ] ")" block ;
statement   = exprStmt | ifStmt | whileStmt | forStmt | returnStmt
            | "ruko" ";" | "agla" ";" | block | ";" ;
ifStmt      = "agar" "(" expression ")" statement [ "warna" statement ] ;
whileStmt   = "jabtak" "(" expression ")" statement ;
forStmt     = "chalo" "(" ( varDecl | exprStmt | ";" ) [ expression ] ";" [ expression ] ")" statement ;
returnStmt  = "wapas" [ expression ] ";" ;
block       = "{" { declaration } "}" ;
assignment  = ( IDENT | postfix "[" expression "]" ) assignOp assignment | logicOr ;
postfix     = primary { "(" [ args ] ")" | "[" expression "]" } ;
primary     = NUMBER | STRING | "sach" | "jhooth" | "khaali" | IDENT
            | "(" expression ")" | listLit | dictLit | funcExpr ;
```

(Remaining binary levels follow the precedence list; list and dict literals allow trailing commas and full expressions as elements. A statement starting with `{` is a block.)

Example:

```text
kaam factorial(n) { agar (n <= 1) { wapas 1; } wapas n * factorial(n-1); }
bolo(factorial(5));   // 120
```

## Diagnostics

- `Diagnostic {code, severity, message{hi,en,deva}, span, file, hint?}`. Compile-time ones are collected (program does not run if any error). Runtime throws one `HinglishError` with call-stack frames. Internal bugs throw `InternalError`.
- Codes: E01xx lexical, E02xx syntax, E03xx semantic, E04xx runtime. Resolver: E0301 undefined name, E0302 duplicate declaration, E0303 assign to constant, E0304 use in own initialiser, E0305 `ruko`/`agla` outside loop, E0306 `wapas` outside function, E0307 wrong arity on direct call. E0402 call depth exceeded, E0405 non-boolean condition.
- Messages are bilingual (Hinglish first, English in brackets), with file:line:column, source line, caret. CLI `--lang=en|hi`; a third Devanagari text (`deva`) serves the Hindi website (ADR 0005). Exit codes: 0 ok, 65 compile errors, 70 runtime error.
- Tests assert on codes, never on message text.

## Defects from the audited repo that must never return

Write one regression test per item, named by number.

1. Sign inside number token (`a-1`, `n-1`, `0.1+0.2` failed to parse).
2. Dynamic scoping (function scope was child of the caller).
3. Global function table surviving between runs.
4. Index assignment silently ignored.
5. List/dict elements limited to primary expressions (`[1+2]` failed).
6. No string escapes.
7. Null printed differently via variable vs call result.
8. String `"sari"` accepted as true.
9. Errors without line/column.
10. Multi-word keyword regexes breaking on extra whitespace or newlines.
11. Quadratic tokenizing.
12. `return` via thrown Error.
13. Global singletons, not re-entrant.
14. Break/continue as scope flags.
15. Type checks on AST kinds instead of values.
16. Duplicated call-parsing, no chained calls (`f(x)[0]`).
17. Docs referencing files that do not exist.
18. Dictionaries as plain objects (`d["constructor"]` returned a function).
19. Recursion limited only by host stack (raw stack error at 2000).
20. Non-ASCII keyword regexes that never matched.

## Phases (build in order, commit at each checkpoint)

0. Foundations: scaffold monorepo, CI (typecheck, lint, test), ADRs, spec v0.1, `NOTICE`.
1. Front end: lexer, AST, parser with recovery, diagnostics + renderer, `check`.
2. Resolver + interpreter: expressions, variables, blocks, control flow, functions, closures, `bolo`, `Host`, limits.
3. Collections and strings: lists, dicts on `Map`, index read/write, escapes, remaining built-ins.
4. CLI + REPL: `run`, `check`, `--lang`, exit codes, "did you mean".
5. Corpus migration + hardening: `migrate-ks.ts`, golden programs, fuzz, baseline timings.
6. Docs + playground: Web Worker with timeout, step budget, stdin box.
7. Release 0.1.

MVP = phases 0 to 4 and 7. Out of scope until after 0.1: modules, classes, for-each, `try`/`catch`, string interpolation, integer type, stdlib, Devanagari pack, bytecode VM, LSP. Do not add features outside the MVP without a spec change and golden tests first.

## Git workflow

Initialise with `git init` on `main` if no repo exists. Never commit secrets, `node_modules`, `dist`, or `.env`.

**Commit policy**
- Commit after each noticeable, working step: a scaffold, a stage or feature that builds and passes its tests, a bug fix with its regression test, a docs milestone. One logical change per commit; do not bundle unrelated work.
- Check once, at the end of the task: write all the code first, then run typecheck, lint and tests a single time, fix failures, and make the commits. Never commit a red build, except an explicit `wip` on a feature branch.
- Use short-lived branches off `main` (`feat/lexer`, `fix/negative-numbers`); merge with a fast-forward or squash.
- Stage explicit paths (`git add <paths>`), not `git add -A`, and read `git diff --staged --stat` first.

**Message format: Conventional Commits 1.0**

```text
<type>(<scope>): <imperative summary, lowercase, no period, max 72 chars>

<optional body: what and why, wrapped at 72 columns>

<optional footers: BREAKING CHANGE: ..., Refs: #123>
```

- Types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`, `chore`, `revert`.
- Scopes: `lexer`, `parser`, `ast`, `resolver`, `interpreter`, `runtime`, `diagnostics`, `cli`, `playground`, `docs`, `tests`, `repo`.
- Examples: `feat(lexer): scan numbers and strings with escapes`, `fix(parser): accept minus without space in binary expressions`, `test(tests): add golden program for closures`, `chore(repo): scaffold workspaces and ci`.
- **Do not add a `Co-Authored-By` trailer for Claude, a "Generated with" line, or any session link, in commits or PR descriptions.** This is the owner's explicit instruction and overrides any default attribution.
- Commit with the owner's configured git identity only. Never change git config.
- Never rewrite published history (`push --force`, `reset --hard` on shared branches) without being asked.

## Token economy (follow strictly)

- Read before writing, but read narrowly: use search and `offset`/`limit` for the part you need instead of whole files. Do not re-read a file you just edited.
- Do not paste large files, logs or test output into the conversation. Pipe to `head`, `tail`, or `grep`; show only failing cases.
- Do not run tests after each step. Run the full check at the end; rerun only the failing files (`vitest run path/to/file`) while fixing.
- Keep one source of truth. This file plus `docs/language-spec.md` hold the design; do not re-derive or restate it in replies.
- Write whole files once, in stages (outline, then sections), not repeated full rewrites. Use targeted edits for changes.
- Batch independent tool calls in one turn. Avoid exploratory loops; if two attempts fail, stop and report.
- Replies: lead with the result in one or two sentences. No recap of steps, no restating the diff, no plans the owner did not ask for.
- Do not spawn sub-agents for work you can do directly.
- Keep generated tables and lists short; link to a file instead of inlining it.
- When context grows long, summarise state into `docs/progress.md` (done, next, blockers) and continue from that.

## Working rules

- Strict TypeScript, no `any`. Use an exhaustive `switch` with a `never` check so a missing node kind is a compile error.
- Every new behaviour needs a unit test and, when user-visible, a golden program. Never loosen a golden file without a note in the commit body.
- Keyword changes happen only in `packs/hinglish.ts` and the spec; never hard-code keywords elsewhere.
- Tests that intentionally differ from KannadaScript behaviour are listed in `docs/intentional-changes.md`.
- Keep functions small and files focused. Prefer clear names to comments; comment only the why.
- If a requirement is ambiguous or conflicts with this file, ask one short question rather than guessing.

## Commands (create these in phase 0)

```text
npm run typecheck        tsc --noEmit across workspaces
npm run lint
npm test                 vitest, all packages
npm run test:programs    golden programs only
npm run build            tsup for core and cli
node packages/cli/dist/main.js run examples/hello.hing
```
