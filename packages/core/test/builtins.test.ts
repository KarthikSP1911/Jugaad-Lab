import { describe, expect, it } from 'vitest';
import { run } from '../src/run.js';
import { outputOf, runProgram } from './run-program.js';

describe('built-ins', () => {
  it.each([
    ['lambai("a😀")', '2'],
    ['lambai([1, 2])', '2'],
    ['lambai({ a: 1 })', '1'],
    ['sankhya("-3.5")', '-3.5'],
    ['sankhya("  42 ")', '42'],
    ['shabd(sach) + shabd(khaali)', 'sachkhaali'],
    ['prakar(shabd(1))', 'shabd'],
    ['prakar(1)', 'sankhya'],
    ['prakar(sach)', 'bool'],
    ['prakar(khaali)', 'khaali'],
    ['prakar([])', 'soochi'],
    ['prakar({})', 'kosh'],
    ['prakar(bolo)', 'kaam'],
  ])('evaluates %s', (expression, expected) => {
    expect(outputOf(`bolo(${expression});`)).toBe(`${expected}\n`);
  });

  it('appends and removes the last element', () => {
    expect(outputOf('rakho a = [1]; joro(a, 2); bolo(nikalo(a), a);')).toBe('2 [1]\n');
  });

  it('passes the prompt to the host and returns its line', () => {
    const prompts: string[] = [];
    let output = '';
    run('bolo(suno("Naam? "));', {
      write: (text) => {
        output += text;
      },
      readLine: (prompt) => {
        prompts.push(prompt);
        return 'Asha';
      },
    });
    expect(prompts).toEqual(['Naam? ']);
    expect(output).toBe('Asha\n');
  });

  it.each(['', '+1', '.5', '1.', '1e3', '0x1', '1 2', '\t1', 'x', '9'.repeat(400)])(
    'rejects sankhya(%j)',
    (text) => {
      expect(runProgram(`sankhya(${JSON.stringify(text)});`).codes).toEqual(['E0415']);
    },
  );

  it.each([
    ['nikalo([]);', 'E0414'],
    ['nikalo(1);', 'E0416'],
    ['joro("a", 1);', 'E0416'],
    ['lambai(1);', 'E0416'],
    ['sankhya(1);', 'E0416'],
    ['lambai();', 'E0307'],
    ['rakho f = lambai; f();', 'E0407'],
  ])('rejects %s with %s', (source, code) => {
    expect(runProgram(source).codes).toEqual([code]);
  });

  it('locates an error at the call', () => {
    const { result } = runProgram('rakho a = [];\n  nikalo(a);');
    expect(result.diagnostics[0]?.span).toMatchObject({ line: 2, column: 3 });
  });
});
