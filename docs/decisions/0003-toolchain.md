# 3. Toolchain and version pins

Status: accepted

## Decision

Node 24, npm workspaces, Vitest, tsup, ESLint with typescript-eslint. All
versions are exact and the lockfile is committed.

TypeScript is pinned to 6.0.3 rather than 7.x because typescript-eslint 8.74.0
supports only versions below 6.1.0.

## Consequences

Upgrade TypeScript when typescript-eslint supports the newer release.
