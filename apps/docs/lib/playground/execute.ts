import {
  renderDiagnostic,
  renderRuntimeError,
  run,
  type Diagnostic,
  type DiagnosticCode,
  type Lang,
} from '@jugaad-hinglish/core';
import { everyLanguage, MESSAGES, say, type Messages } from '../i18n/bilingual';

export const FILE = 'main.hing';
export const MAX_STEPS = 5_000_000;
export const MAX_OUTPUT_CHARS = 100_000;
export const MAX_OUTPUT_WRITES = 2_000;

export type Outcome = 'ok' | 'compile-error' | 'runtime-error' | 'stopped';

/** Where an error points, for the editor. Both numbers start at 1. */
export interface Marker {
  line: number;
  column: number;
  code: DiagnosticCode;
}

export interface ExecuteResult {
  outcome: Outcome;
  /** Rendered errors or the reason for stopping; empty on success. */
  message: string;
  /** Code of the first error, when the program had one. */
  code?: DiagnosticCode;
  /** `message` in each language; absent on success. */
  messages?: Messages;
  markers: Marker[];
  /** `suno` was called after the last input line. */
  inputRanOut: boolean;
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
  let inputRanOut = false;
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
      if (lines.length === 0) inputRanOut = true;
      const line = lines.shift() ?? '';
      host.write(`${prompt}${line}\n`);
      return line;
    },
  };

  function failed(
    outcome: Outcome,
    diagnostics: readonly Diagnostic[],
    render: (language: Lang | undefined) => string,
  ): ExecuteResult {
    const messages = everyLanguage(render);
    const first = diagnostics[0];
    return {
      outcome,
      message: messages[lang ?? 'both'],
      messages,
      markers: diagnostics.map(({ code, span }) => ({ line: span.line, column: span.column, code })),
      inputRanOut,
      ...(first ? { code: first.code } : {}),
    };
  }

  const renderOptions = (language: Lang | undefined) => (language ? { lang: language } : {});

  try {
    const result = run(source, host, { file: FILE, maxSteps });
    if (result.status === 'ok') return { outcome: 'ok', message: '', markers: [], inputRanOut };
    if (result.status === 'runtime-error') {
      const { error } = result;
      return failed(result.status, [error.diagnostic], (language) =>
        renderRuntimeError(error, source, renderOptions(language)),
      );
    }
    const { diagnostics } = result;
    return failed(result.status, diagnostics, (language) =>
      diagnostics.map((d) => renderDiagnostic(d, source, renderOptions(language))).join('\n\n'),
    );
  } catch (error) {
    const reason = error instanceof OutputLimit ? MESSAGES.tooMuchOutput : MESSAGES.failed;
    return failed('stopped', [], (language) => say(reason, language));
  }
}
