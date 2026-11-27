import { check, KEYWORDS, renderDiagnostic } from '@jugaad-hinglish/core';
import { builtins, KEYWORD_MEANINGS } from '../reference';
import { askAi, type AskOptions, type Provider } from './client';

/** Longest program or description we send, so one paste cannot cost a fortune. */
export const MAX_INPUT = 20_000;

export interface AssistantResult {
  code: string;
  notes: string;
  provider: Provider;
  model: string;
  /** Compile errors still left in `code`, rendered in English; empty when it checks. */
  problems: string[];
}

type Connection = Pick<AskOptions, 'keys' | 'fetch' | 'models' | 'timeoutMs'>;

/** What the model may use, built from the real keyword table and built-in list. */
export function languageGuide(): string {
  const keywords = [...KEYWORDS]
    .map(([word, kind]) => `- ${word}: ${KEYWORD_MEANINGS.en[kind] ?? kind}`)
    .join('\n');
  const builtinGuide = builtins('en').map(({ name, does }) => `- ${name}: ${does}`).join('\n');
  return `You write programs in Jugaad Hinglish, a small beginner language with Roman-script Hindi keywords.
Use ONLY what is listed here. Anything else does not exist and will not compile.

Keywords:
${keywords}

Built-in functions (the complete list):
${builtinGuide}

Rules:
- Every statement ends with ";". Blocks use { }. Conditions go in ( ).
- if/else: agar (x > 0) { ... } warna agar (x < 0) { ... } warna { ... }
- while: jabtak (i < 10) { ... }   counted loop: chalo (rakho i = 0; i < n; i += 1) { ... }
- There is no for-each: visit a list with chalo and an index, up to lambai(list).
- Functions: kaam jodo(a, b) { wapas a + b; }   anonymous: kaam (x) { wapas x * 2; }
- Conditions must be sach or jhooth (no truthiness: write lambai(s) > 0, not s).
- == never converts types. Lists compare by identity.
- Numbers are floats and "/" never rounds: use neeche(a / b) for whole-number division.
- Strings use "..." on one line and join with +. No string interpolation.
- Dictionaries: { "naam": "Asha" }, read and write with d["naam"]; keys are strings; a missing key reads as khaali.
- No classes, modules, imports, try/catch, ++, --, ternary ?:, or semicolon-free lines. Write i += 1.
- A declaration (rakho/pakka/kaam) directly inside an agar/jabtak/chalo body needs braces.
- bolo(a, b) prints its values separated by spaces. suno("prompt") reads a line as a string; sankhya(text) turns it into a number.
- Always write the keyword spellings listed above (jhooth, not jhoot), even if the user wrote another spelling.
- Prefer clear Hinglish variable names (naam, umar, kul, ginti) unless the user's names should be kept.

Example:
kaam factorial(n) {
    agar (n <= 1) { wapas 1; }
    wapas n * factorial(n - 1);
}
chalo (rakho i = 1; i <= 3; i += 1) {
    bolo(i, factorial(i));
}

Answer as JSON {"code": ..., "notes": ...}. "code" is the complete program only, no markdown fences.
"notes" is short and written in simple Hinglish: Hindi words in Roman script, like "Har statement ke baad ; lagaya".
Never write the notes in plain English. One point per line, starting with "- ". Only describe what the code really does.`;
}

/** Turns code in another language, or a description, into Jugaad Hinglish. */
export function translate(source: string, connection: Connection): Promise<AssistantResult> {
  const request = `Translate this into a complete Jugaad Hinglish program with the same behaviour.
It may be code in another language (Python, JavaScript, C, ...) or a description in English or Hindi.
If it uses something Jugaad Hinglish lacks, rebuild it with what exists and say so in the notes.

${clip(source)}`;
  return askChecked(request, connection);
}

/**
 * Fixes the program's compile errors, or the runtime error from its last run.
 * Returns null without calling Gemini when there is nothing to fix.
 */
export function fix(
  code: string,
  runtimeError: string | undefined,
  connection: Connection,
): Promise<AssistantResult> | null {
  const problems = compileProblems(code);
  if (problems.length === 0 && !runtimeError) return null;
  const request = `Fix this Jugaad Hinglish program. Make the smallest change that works, and keep the author's names, comments and style.
In the notes, list each change and why it was needed, so a beginner learns from it.

Problems reported:
${[...problems, ...(runtimeError ? [runtimeError] : [])].join('\n\n')}

Program:
${clip(code)}`;
  return askChecked(request, connection);
}

/** Asks once, and once more with the compiler's errors if the answer does not compile. */
async function askChecked(request: string, connection: Connection): Promise<AssistantResult> {
  const system = languageGuide();
  const turns: AskOptions['turns'] = [{ role: 'user', text: request }];
  let answer = await askAi({ ...connection, system, turns });
  let problems = compileProblems(answer.code);
  if (problems.length > 0) {
    turns.push(
      { role: 'model', text: JSON.stringify({ code: answer.code, notes: answer.notes }) },
      {
        role: 'user',
        text: `That code does not compile:\n${problems.join('\n\n')}\nReturn a corrected complete program.`,
      },
    );
    answer = await askAi({ ...connection, system, turns });
    problems = compileProblems(answer.code);
  }
  return { ...answer, problems };
}

/** Compile errors as the CLI shows them, in English for the model. */
export function compileProblems(code: string): string[] {
  if (code.trim() === '') return ['The program is empty.'];
  return check(code, { file: 'main.hing' })
    .diagnostics.filter((d) => d.severity === 'error')
    .map((d) => renderDiagnostic(d, code, { lang: 'en' }));
}

function clip(text: string): string {
  return text.length > MAX_INPUT ? `${text.slice(0, MAX_INPUT)}\n[cut off]` : text;
}
