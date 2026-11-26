import type { Value } from '../runtime/value.js';

/** How a statement finished; `wapas`, `ruko` and `agla` travel this way. */
export type Completion =
  | { type: 'normal' }
  | { type: 'break' }
  | { type: 'continue' }
  | { type: 'return'; value: Value };

export const NORMAL: Completion = Object.freeze({ type: 'normal' });
