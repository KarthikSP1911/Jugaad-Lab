import type { Fail } from '../../diagnostics/diagnostic.js';
import {
  booleanExpected,
  invalidArgument,
  wrongArgumentType,
} from '../../diagnostics/runtime-messages.js';
import { TYPE_NAMES } from '../../packs/hinglish.js';
import { codePointLength, position } from '../collections.js';
import { HinglishFunction, NativeFunction, typeName, type Value } from '../value.js';
import { dictionaryArgument, listArgument, textArgument, textOrListArgument } from './arguments.js';

/** hai, kahan, kaato, ulta, chhanto, har, chuno, daalo, hatao, chaabiyan. */
export function listBuiltins(): NativeFunction[] {
  return [
    // Membership uses the same rule as `==`.
    new NativeFunction('hai', 2, ([where = null, item = null], _host, fail) => {
      if (where instanceof Map) return where.has(textArgument('hai', item, fail));
      const within = textOrListArgument('hai', where, fail);
      if (typeof within === 'string') return within.includes(textArgument('hai', item, fail));
      return within.some((element) => element === item);
    }),
    // Position of the first match, or -1. String positions count code points.
    new NativeFunction('kahan', 2, ([where = null, item = null], _host, fail) => {
      const within = textOrListArgument('kahan', where, fail);
      if (Array.isArray(within)) return within.findIndex((element) => element === item);
      const unit = within.indexOf(textArgument('kahan', item, fail));
      return unit === -1 ? -1 : codePointLength(within.slice(0, unit));
    }),
    // kaato(x, start, end): a new list or string from start up to, not including, end.
    new NativeFunction('kaato', 3, ([value = null, start = null, end = null], _host, fail) => {
      const whole = textOrListArgument('kaato', value, fail);
      const items = typeof whole === 'string' ? Array.from(whole) : whole;
      const container = typeof whole === 'string' ? TYPE_NAMES.string : TYPE_NAMES.list;
      const from = position(start, items.length, container, fail, true);
      const to = position(end, items.length, container, fail, true);
      if (to < from) {
        return fail(
          invalidArgument('kaato', {
            hi: `ant (${to}) shuru (${from}) se pehle hai`,
            en: `the end (${to}) comes before the start (${from})`,
          }),
        );
      }
      const part = items.slice(from, to);
      return typeof whole === 'string' ? part.join('') : part;
    }),
    new NativeFunction('ulta', 1, ([value = null], _host, fail) => {
      const whole = textOrListArgument('ulta', value, fail);
      if (typeof whole === 'string') return Array.from(whole).reverse().join('');
      return [...whole].reverse();
    }),
    // A new list, smallest first; the original is left as it was.
    new NativeFunction('chhanto', 1, ([value = null], _host, fail) => {
      const list = listArgument('chhanto', value, fail);
      if (list.every((item) => typeof item === 'number')) return [...list].sort((a, b) => a - b);
      if (list.every((item) => typeof item === 'string')) {
        return [...list].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
      }
      const expected = `${TYPE_NAMES.list} of only ${TYPE_NAMES.number} or only ${TYPE_NAMES.string}`;
      return fail(wrongArgumentType('chhanto', expected, `mixed ${TYPE_NAMES.list}`));
    }),
    new NativeFunction('har', 2, ([list = null, fn = null], _host, fail, callBack) => {
      const items = [...listArgument('har', list, fail)];
      const apply = functionArgument('har', fn, fail);
      return items.map((item) => callBack(apply, [item]));
    }),
    new NativeFunction('chuno', 2, ([list = null, fn = null], _host, fail, callBack) => {
      const items = [...listArgument('chuno', list, fail)];
      const keep = functionArgument('chuno', fn, fail);
      return items.filter((item) => {
        const answer = callBack(keep, [item]);
        return typeof answer === 'boolean' ? answer : fail(booleanExpected(typeName(answer)));
      });
    }),
    // daalo(list, i, x) puts x at position i; i may equal the length to add at the end.
    new NativeFunction('daalo', 3, ([list = null, index = null, item = null], _host, fail) => {
      const items = listArgument('daalo', list, fail);
      items.splice(position(index, items.length, TYPE_NAMES.list, fail, true), 0, item);
      return null;
    }),
    new NativeFunction('hatao', 2, ([list = null, index = null], _host, fail) => {
      const items = listArgument('hatao', list, fail);
      const at = position(index, items.length, TYPE_NAMES.list, fail);
      return items.splice(at, 1)[0] as Value;
    }),
    new NativeFunction('chaabiyan', 1, ([value = null], _host, fail) => [
      ...dictionaryArgument('chaabiyan', value, fail).keys(),
    ]),
  ];
}

function functionArgument(name: string, value: Value, fail: Fail): Value {
  if (value instanceof HinglishFunction || value instanceof NativeFunction) return value;
  return fail(wrongArgumentType(name, TYPE_NAMES.function, typeName(value)));
}
