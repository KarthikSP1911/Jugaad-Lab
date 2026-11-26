import type { Host } from '@jugaad-hinglish/core';

/** Everything the commands need from the outside world. */
export interface Io {
  out(text: string): void;
  err(text: string): void;
  /** `null` at end of input. */
  readLine(): string | null;
  readFile(path: string): string;
}

export function hostFor(io: Io): Host {
  return {
    write: (text) => io.out(text),
    readLine: (prompt) => {
      io.out(prompt);
      return io.readLine() ?? '';
    },
  };
}
