import type { Fail } from '../diagnostics/diagnostic.js';
import {
  emptyList,
  invalidNumber,
  stringTooLong,
  wrongArgumentType,
} from '../diagnostics/runtime-messages.js';
import { TYPE_NAMES } from '../packs/hinglish.js';
import { codePointLength } from './collections.js';
import { toText } from './stringify.js';
import { NativeFunction, typeName, type Value } from './value.js';

/** Optional `-`, digits, optional fraction; surrounding spaces are ignored. */
const NUMBER_TEXT = /^ *(-?[0-9]+(?:\.[0-9]+)?) *$/;

/** Fresh objects on every call, so runs share nothing. */
export function createBuiltins(): NativeFunction[] {
  return [
    new NativeFunction('bolo', null, (args, host, fail) => {
      const texts = args.map((arg) => toText(arg, fail));
      let line: string;
      try {
        line = `${texts.join(' ')}\n`;
      } catch (error) {
        if (error instanceof RangeError) return fail(stringTooLong());
        throw error;
      }
      host.write(line);
      return null;
    }),
    new NativeFunction('suno', 1, ([prompt = null], host, fail) =>
      host.readLine(toText(prompt, fail)),
    ),
    new NativeFunction('lambai', 1, ([value = null], _host, fail) => {
      if (typeof value === 'string') return codePointLength(value);
      if (Array.isArray(value)) return value.length;
      if (value instanceof Map) return value.size;
      const expected = [TYPE_NAMES.string, TYPE_NAMES.list, TYPE_NAMES.dictionary].join(', ');
      return fail(wrongArgumentType('lambai', expected, typeName(value)));
    }),
    new NativeFunction('joro', 2, ([list = null, item = null], _host, fail) => {
      listArgument('joro', list, fail).push(item);
      return null;
    }),
    new NativeFunction('nikalo', 1, ([value = null], _host, fail) => {
      const list = listArgument('nikalo', value, fail);
      if (list.length === 0) return fail(emptyList('nikalo'));
      return list.pop() as Value;
    }),
    new NativeFunction('sankhya', 1, ([text = null], _host, fail) => {
      if (typeof text !== 'string') {
        return fail(wrongArgumentType('sankhya', TYPE_NAMES.string, typeName(text)));
      }
      const number = Number(NUMBER_TEXT.exec(text)?.[1] ?? Number.NaN);
      // Too many digits overflow to Infinity.
      return Number.isFinite(number) ? number : fail(invalidNumber(text));
    }),
    new NativeFunction('shabd', 1, ([value = null], _host, fail) => toText(value, fail)),
    new NativeFunction('prakar', 1, ([value = null]) => typeName(value)),
  ];
}

function listArgument(name: string, value: Value, fail: Fail): Value[] {
  if (Array.isArray(value)) return value;
  return fail(wrongArgumentType(name, TYPE_NAMES.list, typeName(value)));
}
