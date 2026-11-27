import { invalidArgument } from '../../diagnostics/runtime-messages.js';
import { toText } from '../stringify.js';
import { NativeFunction } from '../value.js';
import { buildText, listArgument, textArgument } from './arguments.js';

/** todo, milao, bade, chhote, saaf, badlo. */
export function textBuiltins(): NativeFunction[] {
  return [
    // An empty separator splits into single characters (code points).
    new NativeFunction('todo', 2, ([text = null, separator = null], _host, fail) => {
      const whole = textArgument('todo', text, fail);
      const by = textArgument('todo', separator, fail);
      return by === '' ? Array.from(whole) : whole.split(by);
    }),
    new NativeFunction('milao', 2, ([list = null, separator = null], _host, fail) => {
      const items = listArgument('milao', list, fail).map((item) => toText(item, fail));
      const by = textArgument('milao', separator, fail);
      return buildText(() => items.join(by), fail);
    }),
    textToText('bade', (text) => text.toUpperCase()),
    textToText('chhote', (text) => text.toLowerCase()),
    textToText('saaf', (text) => text.trim()),
    new NativeFunction('badlo', 3, ([text = null, from = null, to = null], _host, fail) => {
      const whole = textArgument('badlo', text, fail);
      const old = textArgument('badlo', from, fail);
      const replacement = textArgument('badlo', to, fail);
      if (old === '') {
        return fail(
          invalidArgument('badlo', {
            hi: 'khaali shabd ko badla nahi ja sakta',
            en: 'cannot replace an empty string',
          }),
        );
      }
      return buildText(() => whole.split(old).join(replacement), fail);
    }),
  ];
}

function textToText(name: string, apply: (text: string) => string): NativeFunction {
  return new NativeFunction(name, 1, ([value = null], _host, fail) =>
    apply(textArgument(name, value, fail)),
  );
}
