import type { Fail } from '../diagnostics/diagnostic.js';
import { stringTooLong } from '../diagnostics/runtime-messages.js';
import { WORDS } from '../packs/hinglish.js';
import { HinglishFunction, NativeFunction, type Value } from './value.js';

/** Bounds collections that share elements, whose text can grow exponentially. */
export const MAX_COLLECTION_TEXT = 2 ** 24;

type Collection = Value[] | Map<string, Value>;

/** Text still to be produced: literal text, a value, or the end of a collection. */
type Task = { text: string } | { value: Value } | { close: Collection };

const ESCAPES: Record<string, string> = { '\\': '\\\\', '"': '\\"', '\n': '\\n', '\t': '\\t' };

const quote = (text: string) => `"${text.replace(/[\\"\n\t]/g, (char) => ESCAPES[char] ?? char)}"`;

/** The one conversion from a value to text, used by output and `+`. */
export function stringify(value: Value): string {
  if (Array.isArray(value) || value instanceof Map) return stringifyCollection(value);
  return stringifyScalar(value);
}

/** `stringify`, reporting text that is too long as a program error. */
export function toText(value: Value, fail: Fail): string {
  try {
    return stringify(value);
  } catch (error) {
    if (error instanceof RangeError) return fail(stringTooLong());
    throw error;
  }
}

function stringifyScalar(value: Exclude<Value, Collection>): string {
  if (value === null) return WORDS.null;
  if (typeof value === 'boolean') return value ? WORDS.true : WORDS.false;
  if (value instanceof HinglishFunction || value instanceof NativeFunction) {
    return value.name === undefined ? `<${WORDS.function}>` : `<${WORDS.function} ${value.name}>`;
  }
  return String(value);
}

/** Walks with an explicit stack, so any depth of nesting is safe. */
function stringifyCollection(root: Collection): string {
  let result = '';
  /** Collections being printed right now; meeting one again is a cycle. */
  const open = new Set<Collection>();
  const tasks: Task[] = [{ value: root }];
  for (let task = tasks.pop(); task; task = tasks.pop()) {
    if ('close' in task) {
      open.delete(task.close);
      result += Array.isArray(task.close) ? ']' : '}';
    } else if ('text' in task) {
      result += task.text;
    } else {
      const { value } = task;
      if (typeof value === 'string') {
        result += quote(value);
      } else if (!Array.isArray(value) && !(value instanceof Map)) {
        result += stringifyScalar(value);
      } else if (open.has(value)) {
        result += Array.isArray(value) ? '[...]' : '{...}';
      } else {
        open.add(value);
        result += Array.isArray(value) ? '[' : '{';
        pushContents(tasks, value);
      }
    }
    if (result.length > MAX_COLLECTION_TEXT) throw new RangeError('Invalid string length');
  }
  return result;
}

/** Pushed in reverse, so tasks pop in printing order. */
function pushContents(tasks: Task[], collection: Collection): void {
  const items: [string, Value][] = Array.isArray(collection)
    ? collection.map((item) => ['', item])
    : [...collection].map(([key, item]) => [`${quote(key)}: `, item]);
  tasks.push({ close: collection });
  for (let i = items.length - 1; i >= 0; i -= 1) {
    const [label, value] = items[i] as [string, Value];
    tasks.push({ value }, { text: i === 0 ? label : `, ${label}` });
  }
}
