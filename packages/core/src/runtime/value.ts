import type { Fail } from '../diagnostics/diagnostic.js';
import type { Name } from '../ast/expr.js';
import type { Block } from '../ast/stmt.js';
import { TYPE_NAMES } from '../packs/hinglish.js';
import type { Environment } from './environment.js';
import type { Host } from './host.js';

export class HinglishFunction {
  constructor(
    readonly name: string | undefined,
    readonly params: readonly Name[],
    readonly body: Block,
    readonly closure: Environment,
  ) {}
}

export class NativeFunction {
  constructor(
    readonly name: string,
    /** `null` accepts any number of arguments. */
    readonly arity: number | null,
    /** `fail` reports a program error at the call; `callBack` runs a function value. */
    readonly call: (args: readonly Value[], host: Host, fail: Fail, callBack: CallBack) => Value,
  ) {}
}

/** Calls a Hinglish or native function from inside a built-in. */
export type CallBack = (callee: Value, args: readonly Value[]) => Value;

export type Value =
  | number
  | string
  | boolean
  | null
  | Value[]
  | Map<string, Value>
  | HinglishFunction
  | NativeFunction;

export function typeName(value: Value): string {
  if (value === null) return TYPE_NAMES.null;
  if (typeof value === 'number') return TYPE_NAMES.number;
  if (typeof value === 'string') return TYPE_NAMES.string;
  if (typeof value === 'boolean') return TYPE_NAMES.boolean;
  if (Array.isArray(value)) return TYPE_NAMES.list;
  if (value instanceof Map) return TYPE_NAMES.dictionary;
  return TYPE_NAMES.function;
}
