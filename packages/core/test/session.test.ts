import { describe, expect, it } from 'vitest';
import { createSession } from '../src/session.js';

function start() {
  let output = '';
  const session = createSession({
    write: (text) => {
      output += text;
    },
    readLine: () => '',
  });
  return { session, output: () => output };
}

describe('session', () => {
  it('keeps names between entries and echoes a final expression', () => {
    const { session, output } = start();
    session.evaluate('rakho x = 2; kaam dugna(n) { wapas n * 2; }');
    expect(session.evaluate('dugna(x);')).toMatchObject({ status: 'ok', echo: '4' });
    expect(session.evaluate('bolo(x);')).not.toHaveProperty('echo');
    expect(session.evaluate('x = 3;')).not.toHaveProperty('echo');
    expect(output()).toBe('2\n');
  });

  it('declares nothing from a rejected entry', () => {
    const { session } = start();
    expect(session.evaluate('rakho a = 1; bolo(b);').status).toBe('compile-error');
    expect(session.evaluate('rakho a = 2;').status).toBe('ok');
  });

  it('forgets names a failed entry never defined', () => {
    const { session } = start();
    expect(session.evaluate('rakho a = 1; bolo(1 / 0); rakho b = 2;').status).toBe('runtime-error');
    expect(session.evaluate('rakho b = a;').status).toBe('ok');
  });

  it('numbers lines across entries', () => {
    const { session } = start();
    session.evaluate('kaam f() { wapas 1 / 0; }');
    const result = session.evaluate('f();');
    expect(result.diagnostics[0]?.span.line).toBe(1);
    expect(session.evaluate('nahi_hai;').diagnostics[0]?.span.line).toBe(3);
  });
});
