// One-off translator for the KannadaScript test corpus.
//   node tools/migrate-ks.ts <KannadaScript repo> <output directory>
// The corpus is only parsed, never executed. Build core first.
import { check, hinglish, run } from '@jugaad-hinglish/core';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

const PHRASES: [string[], string][] = [
  [['enu', 'illa', 'andre'], 'warna'],
  [['illa', 'andre'], 'warna'],
  [['saaku', 'nilsu'], 'ruko'],
  [['munde', 'nodu'], 'agla'],
  [['matte', 'sigona'], ''],
];
const WORDS = new Map([
  ['enadru', 'agar'],
  ['ellivargu', 'jabtak'],
  ['karya', 'kaam'],
  ['vapasu', 'wapas'],
  ['sari', 'sach'],
  ['thappu', 'jhooth'],
  ['khali', 'khaali'],
  ['idu', 'rakho'],
  ['saalu', 'rakho'],
  ['dict', 'rakho'],
]);

const TOKEN = /\/\/[^\n]*|\/\*[\s\S]*?\*\/|"[^"]*"|'[^']*'|[\p{ID_Continue}_]+|\s+|[\s\S]/gu;

const isTrivia = (token: string) => /^(\s|\/\/|\/\*)/.test(token);
const isWord = (token: string) => /^[\p{ID_Continue}_]/u.test(token);

/** Index of the next token that is not whitespace or a comment. */
function next(tokens: readonly string[], from: number): number {
  let i = from;
  while (i < tokens.length && isTrivia(tokens[i] as string)) i += 1;
  return i;
}

/** Drops the program wrapper, including any text before it. */
function unwrap(tokens: string[]): string[] {
  const start = tokens.indexOf('namaskara');
  if (start === -1) return tokens;
  const after = next(tokens, start + 1);
  return tokens.slice(tokens[after] === ';' ? after + 1 : start + 1);
}

function translateWords(tokens: readonly string[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i] as string;
    const phrase = PHRASES.map(([words, text]) => {
      let at = i;
      for (const [n, word] of words.entries()) {
        if (n > 0) at = next(tokens, at + 1);
        if (tokens[at] !== word) return undefined;
      }
      return { text, end: at };
    }).find((match) => match !== undefined);
    if (phrase) {
      i = phrase.end;
      // Either `else` phrase followed by a condition is an `else if`.
      if (phrase.text === 'warna' && tokens[next(tokens, i + 1)] === '(') {
        result.push('warna agar');
      } else if (phrase.text !== '') result.push(phrase.text);
      else if (tokens[next(tokens, i + 1)] === ';') i = next(tokens, i + 1);
    } else if (token.startsWith('"') || token.startsWith("'")) {
      // KannadaScript has no escapes, so a backslash is an ordinary character.
      result.push(token.replaceAll('\\', '\\\\'));
    } else if (token === 'helu') {
      result.push(token);
    } else if (WORDS.has(token)) {
      result.push(WORDS.get(token) as string);
    } else if (isWord(token) && hinglish.has(token)) {
      result.push(`${token}_`);
    } else {
      result.push(token);
    }
  }
  return result;
}

/** `helu a, b;` becomes `bolo(a, b);` and `idu a, b;` becomes two declarations. */
function translateStatements(tokens: readonly string[]): string {
  let result = '';
  let depth = 0;
  let statement: { kind: 'print' | 'declare'; depth: number } | undefined;
  const finish = () => {
    if (statement?.kind === 'print') {
      const body = result.trimEnd();
      result = `${body})${result.slice(body.length)}`;
    }
    statement = undefined;
  };
  for (const token of tokens) {
    if (statement && depth === statement.depth && (token === ';' || token === '}')) finish();
    if (token === '(' || token === '[' || token === '{') depth += 1;
    if (token === ')' || token === ']' || token === '}') depth -= 1;
    if (token === 'helu') {
      statement = { kind: 'print', depth };
      result += 'bolo(';
    } else if (statement?.kind === 'print' && result.endsWith('bolo(') && /^\s+$/.test(token)) {
      continue;
    } else if (token === 'rakho') {
      statement = { kind: 'declare', depth };
      result += token;
    } else if (token === ',' && statement?.kind === 'declare' && depth === statement.depth) {
      result += '; rakho';
    } else {
      result += token;
    }
  }
  finish();
  return result;
}

function dedent(text: string): string {
  const lines = text
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trimEnd());
  while (lines[0] === '') lines.shift();
  while (lines.at(-1) === '') lines.pop();
  const indents = lines.filter(Boolean).map((line) => line.length - line.trimStart().length);
  const cut = indents.length > 0 ? Math.min(...indents) : 0;
  return `${lines.map((line) => line.slice(cut)).join('\n')}\n`;
}

export function translate(source: string): string {
  const tokens = unwrap(source.match(TOKEN) ?? []);
  return dedent(translateStatements(translateWords(tokens)));
}

/** A longer output means a loop that never ends. */
const MAX_GOLDEN_OUTPUT = 10_000;

interface Case {
  id: string;
  title: string;
  source: string;
  /** Parser cases are only checked; the others run. */
  runs: boolean;
  shouldFail: boolean;
  expected?: string;
}

/** Reads `{ name, input, output }` objects from a test file without running it. */
function providerCases(path: string): { title: string; input: string; output?: string }[] {
  const file = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
  const found: { title: string; input: string; output?: string }[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isObjectLiteralExpression(node)) {
      const text = new Map<string, string>();
      for (const property of node.properties) {
        if (!ts.isPropertyAssignment(property)) continue;
        const value = property.initializer;
        if (ts.isStringLiteralLike(value)) text.set(property.name.getText(file), value.text);
      }
      const input = text.get('input');
      const output = text.get('output');
      if (input !== undefined) {
        const title = text.get('name') ?? '';
        found.push(output === undefined ? { title, input } : { title, input, output });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return found;
}

function collect(repo: string): Case[] {
  const cases: Case[] = [];
  for (const directory of ['.', 'tests', 'packages/cli']) {
    for (const name of readdirSync(join(repo, directory)).filter((f) => f.endsWith('.ks'))) {
      cases.push({
        id: `file-${name.replace(/\.ks$/, '').replaceAll('_', '-')}`,
        title: `${directory}/${name}`,
        source: readFileSync(join(repo, directory, name), 'utf8'),
        runs: true,
        shouldFail: false,
      });
    }
  }
  const providers = [
    ['interpreter-ok', 'interpreter/test/integration/positiveTestsProvider.ts', true, false],
    ['interpreter-fail', 'interpreter/test/integration/negativeTestsProvider.ts', true, true],
    ['parser-ok', 'parser/test/integration/positiveTestsHelper.ts', false, false],
    ['parser-fail', 'parser/test/integration/negativeTestsHelper.ts', false, true],
  ] as const;
  for (const [prefix, path, runs, shouldFail] of providers) {
    for (const [i, found] of providerCases(join(repo, 'packages', path)).entries()) {
      const entry: Case = {
        id: `${prefix}-${String(i + 1).padStart(3, '0')}`,
        title: found.title,
        source: found.input,
        runs,
        shouldFail,
      };
      // Parser cases expect an AST as JSON, which does not carry over.
      if (runs && found.output !== undefined) entry.expected = found.output;
      cases.push(entry);
    }
  }
  return cases;
}

const sameOutput = (actual: string, expected: string) => {
  const mapped = expected.replace(/\b(khali|sari|thappu)\b/g, (word) => WORDS.get(word) ?? word);
  const lines = actual.trimEnd().split('\n');
  return [expected, mapped].some((text) => lines.includes(text));
};

function migrate(repo: string, target: string): void {
  mkdirSync(target, { recursive: true });
  const seen = new Set<string>();
  const differences: string[] = [];
  let written = 0;
  for (const { id, title, source, runs, shouldFail, expected } of collect(repo)) {
    const program = translate(source);
    const key = `${runs} ${program}`;
    if (seen.has(key)) continue;
    seen.add(key);
    let output = '';
    const host = {
      write: (text: string) => {
        output += text;
      },
      readLine: () => '',
    };
    // Parser cases are stored as written and only checked.
    const result = runs
      ? run(program, host, { maxSteps: 1_000_000 }).diagnostics
      : check(program).diagnostics;
    const errors = result.map((d) => `${d.code} ${d.span.line}:${d.span.column}\n`).join('');
    if (output.length > MAX_GOLDEN_OUTPUT) {
      differences.push(`| ${id} | ${title} | output | skipped: endless output |`);
      continue;
    }
    writeFileSync(join(target, `${id}.hing`), program);
    if (errors) writeFileSync(join(target, `${id}.err`), errors);
    if (runs) writeFileSync(join(target, `${id}.out`), output);
    written += 1;
    const codes = result.map((d) => d.code).join(', ');
    if (shouldFail && !codes) differences.push(`| ${id} | ${title} | error | accepted |`);
    else if (!shouldFail && codes) differences.push(`| ${id} | ${title} | success | ${codes} |`);
    else if (expected !== undefined && !sameOutput(output, expected)) {
      differences.push(`| ${id} | ${title} | \`${expected}\` | \`${output.trimEnd()}\` |`);
    }
  }
  process.stdout.write(`${written} programs written, ${differences.length} differ\n`);
  process.stdout.write(`${differences.join('\n')}\n`);
}

const [repo, target] = process.argv.slice(2);
if (!repo || !target) {
  process.stderr.write('usage: node tools/migrate-ks.ts <repo> <output directory>\n');
  process.exitCode = 64;
} else {
  migrate(repo, target);
}
