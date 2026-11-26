// Baseline timings. Build core first, then: node tools/benchmark.ts
import { run } from '@jugaad-hinglish/core';
import { cpus } from 'node:os';

const RUNS = 5;
const PROGRAMS = {
  '1,000,000-iteration loop': `rakho jod = 0;
    chalo (rakho i = 0; i < 1000000; i += 1) { jod += i; }
    bolo(jod);`,
  'recursive fib(25)': `kaam fib(n) { agar (n < 2) { wapas n; } wapas fib(n - 1) + fib(n - 2); }
    bolo(fib(25));`,
};
const host = { write: () => {}, readLine: () => '' };

process.stdout.write(`Node ${process.version}, ${process.platform}, ${cpus()[0]?.model}\n`);
for (const [name, source] of Object.entries(PROGRAMS)) {
  const times = Array.from({ length: RUNS }, () => {
    const start = performance.now();
    const { status } = run(source, host);
    if (status !== 'ok') throw new Error(`${name}: ${status}`);
    return performance.now() - start;
  }).sort((a, b) => a - b);
  const [min, median, max] = [times[0], times[Math.floor(RUNS / 2)], times[RUNS - 1]].map((t) =>
    Math.round(t as number),
  );
  process.stdout.write(`${name}: median ${median} ms (min ${min}, max ${max})\n`);
}
