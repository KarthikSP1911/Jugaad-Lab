import { InternalError } from '../diagnostics/internal-error.js';
import { WORDS } from '../packs/hinglish.js';
import { HinglishFunction, NativeFunction, type Value } from './value.js';

/** The one conversion from a value to text, used by output and `+`. */
export function stringify(value: Value): string {
  if (value === null) return WORDS.null;
  if (typeof value === 'boolean') return value ? WORDS.true : WORDS.false;
  if (typeof value === 'number' || typeof value === 'string') return String(value);
  if (value instanceof HinglishFunction || value instanceof NativeFunction) {
    return value.name === undefined ? `<${WORDS.function}>` : `<${WORDS.function} ${value.name}>`;
  }
  throw new InternalError('lists and dictionaries are not supported yet');
}
