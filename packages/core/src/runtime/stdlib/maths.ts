import type { Fail } from '../../diagnostics/diagnostic.js';
import { emptyList, invalidArgument } from '../../diagnostics/runtime-messages.js';
import { NativeFunction, type Value } from '../value.js';
import { numberArgument, wholeArgument } from './arguments.js';

/** mod, vargmool, ghaat, gol, neeche, upar, adhiktam, nyuntam, kismat. */
export function mathBuiltins(): NativeFunction[] {
  return [
    unary('mod', Math.abs),
    new NativeFunction('vargmool', 1, ([value = null], _host, fail) => {
      const x = numberArgument('vargmool', value, fail);
      if (x < 0) {
        return fail(
          invalidArgument('vargmool', {
            hi: 'negative sankhya ka vargmool nahi hota',
            en: 'a negative number has no square root',
          }),
        );
      }
      return Math.sqrt(x);
    }),
    new NativeFunction('ghaat', 2, ([base = null, power = null], _host, fail) => {
      const result = numberArgument('ghaat', base, fail) ** numberArgument('ghaat', power, fail);
      if (Number.isNaN(result)) {
        return fail(
          invalidArgument('ghaat', {
            hi: 'negative sankhya ki adhoori ghaat nahi hoti',
            en: 'a negative number cannot take a fractional power',
          }),
        );
      }
      return result;
    }),
    // Halves round away from zero (2.5 -> 3, -2.5 -> -3), as taught in school.
    unary('gol', (x) => Math.sign(x) * Math.round(Math.abs(x))),
    unary('neeche', Math.floor),
    unary('upar', Math.ceil),
    extreme('adhiktam', Math.max),
    extreme('nyuntam', Math.min),
    new NativeFunction('kismat', 2, ([low = null, high = null], host, fail) => {
      const from = wholeArgument('kismat', low, fail);
      const to = wholeArgument('kismat', high, fail);
      if (from > to) {
        return fail(
          invalidArgument('kismat', {
            hi: `pehli sankhya (${from}) doosri (${to}) se badi hai`,
            en: `the first number (${from}) is larger than the second (${to})`,
          }),
        );
      }
      const random = host.random?.() ?? Math.random();
      return from + Math.floor(random * (to - from + 1));
    }),
  ];
}

function unary(name: string, apply: (x: number) => number): NativeFunction {
  return new NativeFunction(name, 1, ([value = null], _host, fail) =>
    apply(numberArgument(name, value, fail)),
  );
}

/** Takes numbers as separate arguments or as one list: adhiktam(3, 7) or adhiktam(marks). */
function extreme(name: string, pick: (...xs: number[]) => number): NativeFunction {
  return new NativeFunction(name, null, (args, _host, fail) => {
    const [first] = args;
    const values: readonly Value[] = args.length === 1 && Array.isArray(first) ? first : args;
    if (values.length === 0) return fail(emptyList(name));
    return pick(...numbers(name, values, fail));
  });
}

function numbers(name: string, values: readonly Value[], fail: Fail): number[] {
  return values.map((value) => numberArgument(name, value, fail));
}
