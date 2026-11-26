/** The only way a running program reaches the outside world. */
export interface Host {
  write(text: string): void;
  readLine(prompt: string): string;
}
