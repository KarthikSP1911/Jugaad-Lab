# Architecture

## Packages

| Package | Role | May import |
| --- | --- | --- |
| `packages/core` | the language; runs in Node and the browser | only itself |
| `packages/cli` | command line, REPL and Node host | `core`, Node |
| `apps/docs` | website and browser playground | `core`, npm packages |

Dependencies point one way: the applications import `core`, never the reverse.
ESLint enforces the `core` import rule, and its TypeScript config loads no Node
or DOM types. No package keeps global mutable state.

## Interpreter (`packages/core/src`)

```text
source -> Lexer -> Token[] -> Parser -> Program AST -> Resolver -> Interpreter -> Runtime
```

All stages report to one `Diagnostic` channel. I/O goes through an injected,
synchronous `Host`.

| Folder or file | Responsibility |
| --- | --- |
| `lexer/` | scanner and tokens |
| `packs/` | keyword spellings, the only place they are defined |
| `ast/` | expression and statement types |
| `parser/` | recursive descent with error recovery |
| `resolver/` | scopes and compile-time checks |
| `interpreter/` | tree-walking evaluation |
| `runtime/` | values, environments, built-ins and the `Host` |
| `diagnostics/` | codes, messages in three languages and rendering |
| `check.ts`, `run.ts`, `session.ts` | entry points; `index.ts` is the public API |

## Command line (`packages/cli/src`)

| File | Responsibility |
| --- | --- |
| `main.ts` | process entry |
| `cli.ts` | arguments, commands and exit codes |
| `repl.ts` | interactive prompt |
| `io.ts` | the outside world as an interface, so tests need no process |
| `host-node.ts` | synchronous standard streams |
| `messages.ts` | the command line's own text, in English and Hinglish |
| `report.ts` | error colour and layout |

## Website (`apps/docs`)

| Folder | Holds |
| --- | --- |
| `app/` | routes and page layouts only |
| `components/` | React components: `layout`, `ui`, `content`, `search`, `mascot`, `playground` |
| `hooks/` | stateful browser logic shared by or split from components |
| `lib/` | code without JSX: `editor`, `playground`, `content`, `search`, `mascot`, `i18n`, `config` |
| `styles/` | style sheets, imported in cascade order by `app/globals.css` |
| `test/` | unit tests, in folders named after those in `lib/` |
| `public/`, `assets/`, `scripts/` | static files, the logo source and the script that makes the icons |

Where new code goes:

- Logic that can be tested without a browser belongs in `lib/`.
- State and effects that outgrow a component belong in `hooks/`.
- Components may import `hooks/` and `lib/`. `lib/` imports neither.
- Reference text is read from `docs/` at build time, so it is written once.

### The playground

`components/playground/playground.tsx` joins two hooks to the panes:

| Part | Responsibility |
| --- | --- |
| `hooks/use-program` | the program being edited: draft, share links and undo |
| `hooks/use-runner` | the Web Worker, output, errors and time limit |
| `lib/playground/execute` | one run of `core`, with output limits |
| `lib/editor/` | highlighting, suggestions and editing commands |

## Tests

| Location | Covers |
| --- | --- |
| `packages/*/test`, `apps/docs/test` | units |
| `tests/programs` | golden programs: `name.hing` with `name.out` or `name.err` |
| `tests/docs-links.test.ts` | links between documents |

Why things are this way: [decision records](decisions/).
