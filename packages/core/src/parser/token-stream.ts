import { InternalError } from '../diagnostics/internal-error.js';
import type { Span } from '../diagnostics/span.js';
import type { Token, TokenKind } from '../lexer/token.js';

/** A cursor over tokens that never moves past the final `EOF`. */
export class TokenStream {
  position = 0;

  constructor(private readonly tokens: readonly Token[]) {
    if (tokens.at(-1)?.kind !== 'EOF') throw new InternalError('token list must end with EOF');
  }

  peek(offset = 0): Token {
    return this.at(Math.min(this.position + offset, this.tokens.length - 1));
  }

  previous(): Token {
    return this.at(Math.max(this.position - 1, 0));
  }

  check(kind: TokenKind): boolean {
    return this.peek().kind === kind;
  }

  advance(): Token {
    const token = this.peek();
    if (token.kind !== 'EOF') this.position += 1;
    return token;
  }

  match(kind: TokenKind): boolean {
    if (!this.check(kind)) return false;
    this.advance();
    return true;
  }

  /** From the start of `first` to the end of the last consumed token. */
  spanFrom(first: Span): Span {
    const { start, line, column } = first;
    return { start, end: Math.max(this.previous().end, first.end), line, column };
  }

  private at(index: number): Token {
    const token = this.tokens[index];
    if (token === undefined) throw new InternalError(`no token at index ${index}`);
    return token;
  }
}
