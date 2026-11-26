# Architecture

```text
source -> Lexer -> Token[] -> Parser -> Program AST -> Resolver -> Interpreter -> Runtime
```

All stages report to one `Diagnostic` channel. I/O goes through an injected,
synchronous `Host`.

| Package | Role | May import |
| --- | --- | --- |
| `packages/core` | the language; runs in Node and the browser | only itself |
| `packages/cli` | command line and Node host | `core`, Node |

ESLint enforces the `core` import rule, and its TypeScript config loads no Node
or DOM types. Neither package keeps global mutable state.
