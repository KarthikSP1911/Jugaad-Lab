import { run, type RunOptions } from '../src/run.js';

export function runProgram(source: string, options: RunOptions = {}) {
  let output = '';
  const host = {
    write: (text: string) => {
      output += text;
    },
    readLine: () => '',
  };
  const result = run(source, host, options);
  return { output, result, codes: result.diagnostics.map((d) => d.code) };
}

/** The printed output of a program that must succeed. */
export function outputOf(source: string): string {
  const { output, codes } = runProgram(source);
  if (codes.length > 0) throw new Error(`unexpected diagnostics: ${codes.join(', ')}`);
  return output;
}
