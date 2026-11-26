# 1. TypeScript tree-walking interpreter

Status: accepted

## Decision

Implement the language as a tree-walking interpreter in strict TypeScript, with
a platform-neutral `core` package.

## Consequences

One implementation serves the CLI and the browser playground. It is slower than
a native implementation and bound by the JavaScript call stack. A bytecode VM is
out of scope until after 0.1.
