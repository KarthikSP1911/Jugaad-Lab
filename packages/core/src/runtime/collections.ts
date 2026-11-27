import type { Fail } from '../diagnostics/diagnostic.js';
import {
  indexOutOfRange,
  notIndexable,
  stringReadOnly,
  wrongIndexType,
} from '../diagnostics/runtime-messages.js';
import { TYPE_NAMES } from '../packs/hinglish.js';
import { typeName, type Value } from './value.js';

/** Reads `object[index]`. A missing dictionary key reads as null. */
export function readIndex(object: Value, index: Value, fail: Fail): Value {
  if (object instanceof Map) return object.get(dictionaryKey(index, fail)) ?? null;
  if (Array.isArray(object)) {
    return object[position(index, object.length, TYPE_NAMES.list, fail)] as Value;
  }
  if (typeof object === 'string') {
    const at = position(index, codePointLength(object), TYPE_NAMES.string, fail);
    return codePointAt(object, at);
  }
  return fail(notIndexable(typeName(object)));
}

export function writeIndex(object: Value, index: Value, value: Value, fail: Fail): void {
  if (object instanceof Map) {
    object.set(dictionaryKey(index, fail), value);
  } else if (Array.isArray(object)) {
    object[position(index, object.length, TYPE_NAMES.list, fail)] = value;
  } else if (typeof object === 'string') {
    fail(stringReadOnly());
  } else {
    fail(notIndexable(typeName(object)));
  }
}

/** Strings are measured in Unicode code points, not UTF-16 units. */
export function codePointLength(text: string): number {
  let length = 0;
  for (let unit = 0; unit < text.length; unit += width(text, unit)) length += 1;
  return length;
}

function codePointAt(text: string, position: number): string {
  let unit = 0;
  for (let i = 0; i < position; i += 1) unit += width(text, unit);
  return text.slice(unit, unit + width(text, unit));
}

/** UTF-16 units taken by the code point that starts at `unit`. */
function width(text: string, unit: number): number {
  return (text.codePointAt(unit) as number) > 0xffff ? 2 : 1;
}

function dictionaryKey(index: Value, fail: Fail): string {
  if (typeof index === 'string') return index;
  return fail(wrongIndexType(TYPE_NAMES.dictionary, TYPE_NAMES.string, typeName(index)));
}

/** A whole number from 0 to length - 1, or to `length` itself when `endAllowed`. */
export function position(
  index: Value,
  length: number,
  container: string,
  fail: Fail,
  endAllowed = false,
): number {
  if (typeof index !== 'number' || !Number.isInteger(index)) {
    const found = typeof index === 'number' ? String(index) : typeName(index);
    return fail(wrongIndexType(container, `whole ${TYPE_NAMES.number}`, found));
  }
  const last = endAllowed ? length : length - 1;
  if (index < 0 || index > last) return fail(indexOutOfRange(index, length));
  return index;
}
