import { stringify } from './stringify.js';
import { NativeFunction } from './value.js';

/** Fresh objects on every call, so runs share nothing. */
export function createBuiltins(): NativeFunction[] {
  return [
    new NativeFunction('bolo', null, (args, host) => {
      host.write(`${args.map(stringify).join(' ')}\n`);
      return null;
    }),
  ];
}
