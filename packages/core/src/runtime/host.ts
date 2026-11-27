/** The only way a running program reaches the outside world. */
export interface Host {
  write(text: string): void;
  /** Shows the prompt and returns one line without its line ending. */
  readLine(prompt: string): string;
  /** A number in [0, 1) for `kismat`; defaults to `Math.random`. Tests pass a fixed one. */
  random?(): number;
}
