import type { BinaryOp } from '../ast/expr.js';
import type { DiagnosticDraft } from '../diagnostics/diagnostic.js';
import { divisionByZero, stringTooLong, wrongOperandType } from '../diagnostics/runtime-messages.js';
import { stringify } from '../runtime/stringify.js';
import { typeName, type Value } from '../runtime/value.js';

export type Fail = (draft: DiagnosticDraft) => never;

/** Applies a binary operator, checking the types of the values themselves. */
export function applyBinary(op: BinaryOp, left: Value, right: Value, fail: Fail): Value {
  if (op === '==') return left === right;
  if (op === '!=') return left !== right;
  if (op === '+' && (typeof left === 'string' || typeof right === 'string')) {
    return join(left, right, fail);
  }
  if (typeof left === 'number' && typeof right === 'number') {
    return arithmetic(op, left, right, fail);
  }
  if (typeof left === 'string' && typeof right === 'string') {
    if (op === '<') return left < right;
    if (op === '<=') return left <= right;
    if (op === '>') return left > right;
    if (op === '>=') return left >= right;
  }
  return fail(wrongOperandType(op, `${typeName(left)}, ${typeName(right)}`));
}

function arithmetic(
  op: Exclude<BinaryOp, '==' | '!='>,
  left: number,
  right: number,
  fail: Fail,
): number | boolean {
  switch (op) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return right === 0 ? fail(divisionByZero(op)) : left / right;
    case '%':
      return right === 0 ? fail(divisionByZero(op)) : left % right;
    case '<':
      return left < right;
    case '<=':
      return left <= right;
    case '>':
      return left > right;
    case '>=':
      return left >= right;
    default: {
      const missing: never = op;
      return missing;
    }
  }
}

function join(left: Value, right: Value, fail: Fail): string {
  try {
    return stringify(left) + stringify(right);
  } catch (error) {
    // The engine rejects strings beyond its maximum length.
    if (error instanceof RangeError) return fail(stringTooLong());
    throw error;
  }
}
