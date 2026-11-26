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
    const characters = Array.from(object);
    return characters[position(index, characters.length, TYPE_NAMES.string, fail)] as string;
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

function dictionaryKey(index: Value, fail: Fail): string {
  if (typeof index === 'string') return index;
  return fail(wrongIndexType(TYPE_NAMES.dictionary, TYPE_NAMES.string, typeName(index)));
}

function position(index: Value, length: number, container: string, fail: Fail): number {
  if (typeof index !== 'number' || !Number.isInteger(index)) {
    const found = typeof index === 'number' ? String(index) : typeName(index);
    return fail(wrongIndexType(container, `whole ${TYPE_NAMES.number}`, found));
  }
  if (index < 0 || index >= length) return fail(indexOutOfRange(index, length));
  return index;
}
