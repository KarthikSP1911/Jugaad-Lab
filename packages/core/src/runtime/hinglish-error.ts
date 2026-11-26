import type { Diagnostic } from '../diagnostics/diagnostic.js';
import type { Span } from '../diagnostics/span.js';

export interface Frame {
  /** `undefined` for an anonymous function. */
  functionName: string | undefined;
  /** Where the call was made. */
  span: Span;
}

/** A runtime error in the user's program. */
export class HinglishError extends Error {
  override readonly name = 'HinglishError';

  constructor(
    readonly diagnostic: Diagnostic,
    /** Innermost call first. */
    readonly frames: readonly Frame[],
  ) {
    super(`${diagnostic.code}: ${diagnostic.message.en}`);
  }
}
