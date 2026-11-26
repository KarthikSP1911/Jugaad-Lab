# Jugaad-Lab

<img src="apps/docs/public/logo.png" alt="Jugaad Hinglish logo" width="160">

Jugaad Hinglish (working name): a small, dynamically typed, lexically scoped
programming language with Roman-script Hindi keywords, implemented as a
TypeScript tree-walking interpreter.

**Status:** 0.1.0, not yet tagged or published. Programs run from the command
line, a REPL and a browser playground. The name, file extension, command and
keyword spellings are not final.

```text
kaam factorial(n) { agar (n <= 1) { wapas 1; } wapas n * factorial(n-1); }
bolo(factorial(5));   // 120
```

## Features

- Variables, constants, conditions, loops, functions and closures.
- Numbers, strings, booleans, null, lists, dictionaries and first-class
  functions.
- No implicit truthiness: conditions must be `sach` or `jhooth`, and `==`
  never converts types.
- Errors in Hinglish and English, with a code, file, line, column and caret.
- Call-depth limit, so runaway recursion ends with a language error.

## Quick start

Requires Node 24 or newer.

```sh
git clone https://github.com/KarthikSP1911/Jugaad-Lab.git
cd Jugaad-Lab
npm ci
npm run build
node packages/cli/dist/main.js run examples/hello.hing
```

## Command line

The command is `hinglish`. From a clone, run it as
`node packages/cli/dist/main.js`.

| Command | Does |
| --- | --- |
| `hinglish run <file.hing>` | Check and run a program |
| `hinglish check <file.hing>` | Report compile errors without running |
| `hinglish` or `hinglish repl` | Start the REPL (`.exit` to quit) |
| `hinglish --help`, `--version` | Show usage or the version |

Add `--lang=en` or `--lang=hi` to choose the language of error messages.

| Exit code | Meaning |
| --- | --- |
| 0 | Success |
| 64 | Wrong usage |
| 65 | Compile errors |
| 66 | File could not be read |
| 70 | Runtime or internal error |

## Language at a glance

| Concept | Keyword |
| --- | --- |
| Variable, constant | `rakho`, `pakka` |
| Function, return | `kaam`, `wapas` |
| If, else | `agar`, `warna` |
| While, counted loop | `jabtak`, `chalo` |
| Break, continue | `ruko`, `agla` |
| True, false, null | `sach`, `jhooth`, `khaali` |
| And, or, not | `aur`, `ya`, `nahi` (or `&&`, `\|\|`, `!`) |

Built-in functions: `bolo` (print), `suno` (read a line), `lambai` (length),
`joro` (append), `nikalo` (remove last), `sankhya` (to number), `shabd` (to
string) and `prakar` (type name).

```text
chalo (rakho n = 1; n <= 15; n += 1) {
    agar (n % 15 == 0)      { bolo("FizzBuzz"); }
    warna agar (n % 3 == 0) { bolo("Fizz"); }
    warna agar (n % 5 == 0) { bolo("Buzz"); }
    warna                   { bolo(n); }
}
```

More programs are in [examples/](examples/). The full rules are in the
[language spec](docs/language-spec.md).

## Website

Documentation (getting started, language tour, reference, cheat sheet, error
codes) with search, and an in-browser playground with autocomplete that runs
programs in a Web Worker. It is not deployed yet.

```sh
npm run dev -w @jugaad-hinglish/docs   # http://localhost:3000
npm run build                          # static site in apps/docs/out
```

## Project layout

| Path | Contents |
| --- | --- |
| `packages/core` | Lexer, parser, resolver, interpreter; no Node APIs |
| `packages/cli` | `hinglish` command and REPL |
| `apps/docs` | Documentation site and playground (Next.js) |
| `tests/programs` | Golden programs and their expected output |
| `examples` | Sample programs |
| `tools` | Benchmark and KannadaScript migration scripts |

## Develop

```sh
npm run typecheck
npm run lint
npm test
npm run test:programs   # golden programs only
npm run build
```

## Docs

- [Language spec](docs/language-spec.md)
- [Error codes](docs/error-codes.md)
- [Architecture](docs/architecture.md)
- [Decisions](docs/decisions/)
- [Intentional changes](docs/intentional-changes.md)
- [Baseline timings](docs/baseline-timings.md)
- [Progress](docs/progress.md)
- [Changelog](CHANGELOG.md)
- [Third-party notices](NOTICE)
