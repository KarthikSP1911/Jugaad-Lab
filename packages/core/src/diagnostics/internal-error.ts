/** A bug in the implementation, never a mistake in the user's program. */
export class InternalError extends Error {
  override readonly name = 'InternalError';
}
