# Baseline timings

Measured with `node tools/benchmark.ts` after `npm run build`. No target is set.

Node 24.18.0, Windows 11, 12th Gen Intel Core i5-1235U, 2026-11-26, 5 runs each.
Another agent was working on the machine, so expect some noise.

| Program | Median | Min | Max |
| --- | --- | --- | --- |
| 1,000,000-iteration loop | 531 ms | 380 ms | 616 ms |
| recursive fib(25) | 120 ms | 101 ms | 140 ms |
