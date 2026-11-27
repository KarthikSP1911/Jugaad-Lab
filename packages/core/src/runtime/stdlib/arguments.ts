import type { Fail } from '../../diagnostics/diagnostic.js';
import { stringTooLong, wrongArgumentType } from '../../diagnostics/runtime-messages.js';
import { TYPE_NAMES } from '../../packs/hinglish.js';
import { typeName, type Value } from '../value.js';

/** Argument checks shared by the built-ins; each reports E0416 for the wrong type. */
export function numberArgument(name: string, value: Value, fail: Fail): number {
  if (typeof value === 'number') return value;
  return fail(wrongArgumentType(name, TYPE_NAMES.number, typeName(value)));
}

export function wholeArgument(name: string, value: Value, fail: Fail): number {
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  const found = typeof value === 'number' ? String(value) : typeName(value);
  return fail(wrongArgumentType(name, `whole ${TYPE_NAMES.number}`, found));
}

export function textArgument(name: string, value: Value, fail: Fail): string {
  if (typeof value === 'string') return value;
  return fail(wrongArgumentType(name, TYPE_NAMES.string, typeName(value)));
}

export function listArgument(name: string, value: Value, fail: Fail): Value[] {
  if (Array.isArray(value)) return value;
  return fail(wrongArgumentType(name, TYPE_NAMES.list, typeName(value)));
}

export function dictionaryArgument(name: string, value: Value, fail: Fail): Map<string, Value> {
  if (value instanceof Map) return value;
  return fail(wrongArgumentType(name, TYPE_NAMES.dictionary, typeName(value)));
}

/** For built-ins that work on a string or a list alike. */
export function textOrListArgument(name: string, value: Value, fail: Fail): string | Value[] {
  if (typeof value === 'string' || Array.isArray(value)) return value;
  const expected = `${TYPE_NAMES.string}, ${TYPE_NAMES.list}`;
  return fail(wrongArgumentType(name, expected, typeName(value)));
}

/** Builds a string, turning the engine's length limit into E0409. */
export function buildText(make: () => string, fail: Fail): string {
  try {
    return make();
  } catch (error) {
    if (error instanceof RangeError) return fail(stringTooLong());
    throw error;
  }
}
