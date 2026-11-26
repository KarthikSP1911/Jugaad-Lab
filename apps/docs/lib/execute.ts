import { renderDiagnostic, renderRuntimeError, run, type Lang } from '@jugaad-hinglish/core';
import { MESSAGES, say } from './say';

export const FILE = 'main.hing';
export const MAX_STEPS = 5_000_000;
export const MAX_OUTPUT_CHARS = 100_000;
export const MAX_OUTPUT_WRITES = 2_000;

export type Outcome = 'ok' | 'compile-error' | 'runtime-error' | 'stopped';

export interface ExecuteResult {
  outcome: Outcome;
  /** Rendered errors or the reason for stopping; empty on success. */
  message: string;
}

export interface ExecuteOptions {
  lang?: Lang;
  maxSteps?: number;
  /** Lines for `suno`, separated by newlines. */
  input?: string;
}

class OutputLimit extends Error {}

export function execute(
  source: string,
  write: (text: string) => void,
  options: ExecuteOptions = {},
): ExecuteResult {
  const { lang, maxSteps = MAX_STEPS, input = '' } = options;
  const lines = input === '' ? [] : input.split(/\r?\n/);
  const render = lang ? { lang } : {};
  let chars = 0;
  let writes = 0;
  const host = {
    write(text: string) {
      chars += text.length;
      writes += 1;
      if (chars > MAX_OUTPUT_CHARS || writes > MAX_OUTPUT_WRITES) throw new OutputLimit();
      write(text);
    },
    // Shows the line after its prompt, as a terminal would.
    readLine(prompt: string) {
      const line = lines.shift() ?? '';
      host.write(`${prompt}${line}\n`);
      return line;
    },
  };

  try {
    const result = run(source, host, { file: FILE, maxSteps });
    if (result.status === 'ok') return { outcome: 'ok', message: '' };
    const message =
      result.status === 'runtime-error'
        ? renderRuntimeError(result.error, source, render)
        : result.diagnostics.map((d) => renderDiagnostic(d, source, render)).join('\n\n');
    return { outcome: result.status, message };
  } catch (error) {
    if (error instanceof OutputLimit) {
      return { outcome: 'stopped', message: say(MESSAGES.tooMuchOutput, lang) };
    }
    return { outcome: 'stopped', message: say(MESSAGES.failed, lang) };
  }
}
