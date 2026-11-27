# Contributing

## Setup

You need [Node.js](https://nodejs.org) 24 or newer and Git.

```sh
git clone https://github.com/KarthikSP1911/Jugaad-Lab.git
cd Jugaad-Lab
npm ci
npm run build
```

No environment variables are needed.

## Commands

Run these from the repository root.

| Command | Description |
| --- | --- |
| `npm run dev -w @jugaad-hinglish/docs` | Website at <http://localhost:3000> |
| `npm run typecheck` | Type-check all workspaces |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Report unformatted files |
| `npm test` | Run all tests |
| `npm run test:programs` | Run the golden programs only |
| `npm run build` | Build the packages and the static website |
| `npm run logo -w @jugaad-hinglish/docs` | Regenerate the logo and icons |

Stop the development server before `npm run build`; running both at once can
leave the server broken until it is restarted.

## Where code goes

See [architecture](docs/architecture.md).

## Conventions

- Strict TypeScript, no `any`. Switches over node kinds end in a `never` check.
- File names are kebab-case, one concept per file.
- `packages/core` imports nothing outside itself.
- Keywords are defined only in `packages/core/src/packs/hinglish.ts` and the
  specification.
- Comments explain why, not what.
- Prettier formats code; Markdown is laid out by hand.

## Changes

1. Create a short-lived branch from `main`, such as `feat/lexer` or
   `fix/negative-numbers`.
2. Add a unit test for every new behaviour, and a golden program if users can see
   it. Tests assert error codes, not message text.
3. Update the [specification](docs/language-spec.md) when the language changes.
   New messages, pages and documentation need their Hindi counterpart.
4. Run `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`
   and `npm run build`.
5. Write commits in [Conventional Commits](https://www.conventionalcommits.org)
   form, for example `fix(parser): accept minus without space`.
6. Open a pull request.

Do not copy source from KannadaScript or BhaiLang; write from the specification,
and record any reused material in [NOTICE](NOTICE).
