import { describe, expect, it } from 'vitest';
import { execute } from '../../lib/playground/execute';
import { advise, ERROR_TIPS, pick, REACTIONS, TIPS } from '../../lib/mascot/mascot';
import { SOUNDS } from '../../lib/mascot/sound';

describe('mascot', () => {
  it('has every language for every line', () => {
    const lines = [
      ...Object.values(REACTIONS).flatMap(({ lines }) => lines),
      ...TIPS,
      ...Object.values(ERROR_TIPS),
    ];
    for (const { hi, en, deva } of lines) {
      expect(hi).not.toBe('');
      expect(en).not.toBe('');
      expect(deva).toMatch(/\p{Script=Devanagari}/u);
    }
  });

  it('only asks for sounds that exist', () => {
    for (const { sound } of Object.values(REACTIONS)) {
      if (sound) expect(SOUNDS).toHaveProperty(sound);
    }
  });

  it('cheers on success and worries on every failure', () => {
    expect(REACTIONS.ok.mood).toBe('happy');
    for (const status of ['compile-error', 'runtime-error', 'stopped'] as const) {
      expect(REACTIONS[status].mood).toBe('worried');
    }
  });

  it('matches the tip to the error code', () => {
    const result = execute('bolo(x);', () => {});
    expect(result.code).toBe('E0301');
    expect(advise(result.outcome, result.code, 0)).toBe(ERROR_TIPS.E0301);
  });

  it('reports the code of a runtime error', () => {
    expect(execute('bolo(1 / 0);', () => {}).code).toBe('E0403');
  });

  it('has a tip for errors without a specific one', () => {
    expect(ERROR_TIPS.E0209).toBeUndefined();
    expect(advise('runtime-error', 'E0209', 0)).not.toBeNull();
  });

  it('rotates general tips between runs and stays silent while running', () => {
    expect(advise('ok', undefined, 1)).toBe(TIPS[1]);
    expect(advise('ok', undefined, TIPS.length)).toBe(TIPS[0]);
    expect(advise('running', undefined, 1)).toBeNull();
  });

  it('takes turns with the lines of a reaction', () => {
    const { lines } = REACTIONS.ok;
    expect(pick(lines, 1)).toBe(lines[1]);
    expect(pick(lines, lines.length)).toBe(lines[0]);
  });

  it('plays nothing while running, so a run makes one sound', () => {
    expect(REACTIONS.running.sound).toBeNull();
  });

  it('stays quiet before anything has run', () => {
    expect(REACTIONS.idle.sound).toBeNull();
  });
});
