import { readFileSync, readSync, writeSync } from 'node:fs';
import type { Io } from './io.js';

const NEWLINE = 10;

/** Synchronous standard streams, as the interpreter's `Host` requires. */
export function createNodeIo(): Io {
  return {
    out: (text) => writeAll(1, text),
    err: (text) => writeAll(2, text),
    readLine: readStdinLine,
    readFile: (path) => readFileSync(path, 'utf8'),
  };
}

function writeAll(fd: number, text: string): void {
  const bytes = Buffer.from(text, 'utf8');
  let written = 0;
  while (written < bytes.length) {
    try {
      written += writeSync(fd, bytes, written);
    } catch (error) {
      const { code } = error as NodeJS.ErrnoException;
      // The reader went away, for example `| head`.
      if (code === 'EPIPE') process.exit(0);
      if (code !== 'EAGAIN') throw error;
      pause();
    }
  }
}

/** Reads one byte at a time so nothing beyond the line is consumed. */
function readStdinLine(): string | null {
  const byte = Buffer.alloc(1);
  const line: number[] = [];
  for (;;) {
    let count = 0;
    try {
      count = readSync(0, byte, 0, 1, null);
    } catch (error) {
      const { code } = error as NodeJS.ErrnoException;
      if (code === 'EAGAIN') {
        pause();
        continue;
      }
      // Windows reports the end of console input as an error.
      if (code !== 'EOF') throw error;
    }
    if (count === 0 && line.length === 0) return null;
    if (count === 0 || byte[0] === NEWLINE) break;
    line.push(byte[0] as number);
  }
  return Buffer.from(line).toString('utf8').replace(/\r$/, '');
}

/** Blocks briefly while a non-blocking stream has nothing to offer. */
function pause(): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10);
}
