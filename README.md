# Jugaad-Lab

Jugaad Hinglish (working name): a small, dynamically typed, lexically scoped
programming language with Roman-script Hindi keywords, implemented as a
TypeScript tree-walking interpreter.

**Status:** 0.1.0. Programs run from the command line and a REPL. Names and
keyword spellings are not final.

```text
kaam factorial(n) { agar (n <= 1) { wapas 1; } wapas n * factorial(n-1); }
bolo(factorial(5));   // 120
```

## Use

```sh
npm ci
npm run build
node packages/cli/dist/main.js run examples/hello.hing
node packages/cli/dist/main.js check examples/fizzbuzz.hing --lang=en
node packages/cli/dist/main.js          # REPL
```

## Develop

Requires Node 24.

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

## Docs

- [Language spec](docs/language-spec.md)
- [Error codes](docs/error-codes.md)
- [Architecture](docs/architecture.md)
- [Decisions](docs/decisions/)
- [Progress](docs/progress.md)
- [Changelog](CHANGELOG.md)
