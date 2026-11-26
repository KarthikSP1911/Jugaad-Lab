import { DEFAULT_FILE, DiagnosticBag, type Diagnostic } from '../diagnostics/diagnostic.js';
import {
  invalidEscape,
  malformedNumber,
  unknownCharacter,
  unterminatedComment,
  unterminatedString,
} from '../diagnostics/lexical-messages.js';
import type { Span } from '../diagnostics/span.js';
import { hinglish, type LanguagePack } from '../packs/hinglish.js';
import { isDigit, isIdentifierPart, isIdentifierStart } from './char-class.js';
import type { SymbolKind, Token, TokenKind } from './token.js';

export interface TokenizeOptions {
  file?: string;
  pack?: LanguagePack;
}

export interface TokenizeResult {
  tokens: Token[];
  diagnostics: Diagnostic[];
}

const TWO_CHAR_SYMBOLS: ReadonlyMap<string, SymbolKind> = new Map<string, SymbolKind>([
  ['+=', 'PlusAssign'],
  ['-=', 'MinusAssign'],
  ['*=', 'StarAssign'],
  ['/=', 'SlashAssign'],
  ['%=', 'PercentAssign'],
  ['==', 'EqualEqual'],
  ['!=', 'BangEqual'],
  ['<=', 'LessEqual'],
  ['>=', 'GreaterEqual'],
  ['&&', 'AndAnd'],
  ['||', 'OrOr'],
]);

const ONE_CHAR_SYMBOLS: ReadonlyMap<string, SymbolKind> = new Map<string, SymbolKind>([
  ['(', 'LeftParen'],
  [')', 'RightParen'],
  ['{', 'LeftBrace'],
  ['}', 'RightBrace'],
  ['[', 'LeftBracket'],
  [']', 'RightBracket'],
  [',', 'Comma'],
  [';', 'Semicolon'],
  [':', 'Colon'],
  ['+', 'Plus'],
  ['-', 'Minus'],
  ['*', 'Star'],
  ['/', 'Slash'],
  ['%', 'Percent'],
  ['=', 'Assign'],
  ['<', 'Less'],
  ['>', 'Greater'],
  ['!', 'Bang'],
]);

const ESCAPES: ReadonlyMap<string, string> = new Map([
  ['n', '\n'],
  ['t', '\t'],
  ['\\', '\\'],
  ['"', '"'],
  ["'", "'"],
]);

/** The position where a token or diagnostic begins. */
type Mark = Omit<Span, 'end'>;

class Lexer {
  private pos = 0;
  private line = 1;
  private column = 1;
  private readonly tokens: Token[] = [];
  private readonly bag: DiagnosticBag;

  constructor(
    private readonly source: string,
    file: string,
    private readonly pack: LanguagePack,
  ) {
    this.bag = new DiagnosticBag(file);
  }

  scan(): TokenizeResult {
    if (this.source.startsWith('﻿')) this.pos = 1;
    while (this.pos < this.source.length) this.scanNext();
    this.push('EOF', this.mark());
    return { tokens: this.tokens, diagnostics: this.bag.items };
  }

  private scanNext(): void {
    const char = this.peek();
    if (char === ' ' || char === '\t' || char === '\r' || char === '\n') {
      this.advance();
    } else if (char === '/' && this.peek(1) === '/') {
      this.skipLineComment();
    } else if (char === '/' && this.peek(1) === '*') {
      this.skipBlockComment();
    } else if (isDigit(char)) {
      this.scanNumber();
    } else if (char === '"' || char === "'") {
      this.scanString(char);
    } else if (isIdentifierStart(char)) {
      this.scanWord();
    } else {
      this.scanSymbol();
    }
  }

  private skipLineComment(): void {
    while (this.pos < this.source.length && this.peek() !== '\n') this.advance();
  }

  private skipBlockComment(): void {
    const start = this.mark();
    this.advance();
    this.advance();
    while (this.pos < this.source.length) {
      if (this.peek() === '*' && this.peek(1) === '/') {
        this.advance();
        this.advance();
        return;
      }
      this.advance();
    }
    this.bag.report(unterminatedComment(), { ...start, end: start.start + 2 });
  }

  private scanNumber(): void {
    const start = this.mark();
    this.skipDigits();
    if (this.peek() === '.' && isDigit(this.peek(1))) {
      this.advance();
      this.skipDigits();
    }
    if (isIdentifierStart(this.peek())) {
      while (isIdentifierPart(this.peek())) this.advance();
      const text = this.source.slice(start.start, this.pos);
      this.bag.report(malformedNumber(text), { ...start, end: this.pos });
    }
    this.push('Number', start);
  }

  private skipDigits(): void {
    while (isDigit(this.peek())) this.advance();
  }

  private scanString(quote: string): void {
    const start = this.mark();
    this.advance();
    let value = '';
    while (this.pos < this.source.length) {
      const char = this.peek();
      if (char === quote) {
        this.advance();
        this.push('String', start, value);
        return;
      }
      if (char === '\n' || char === '\r') break;
      if (char === '\\') value += this.scanEscape();
      else value += this.advance();
    }
    this.bag.report(unterminatedString(), { ...start, end: this.pos });
    this.push('String', start, value);
  }

  private scanEscape(): string {
    const start = this.mark();
    this.advance();
    const char = this.peek();
    // A backslash at the end of a line leaves the string unterminated.
    if (char === '' || char === '\n' || char === '\r') return '';
    this.advance();
    const decoded = ESCAPES.get(char);
    if (decoded !== undefined) return decoded;
    this.bag.report(invalidEscape(char), { ...start, end: this.pos });
    return char;
  }

  private scanWord(): void {
    const start = this.mark();
    while (isIdentifierPart(this.peek())) this.advance();
    const word = this.source.slice(start.start, this.pos);
    this.push(this.pack.get(word) ?? 'Identifier', start);
  }

  private scanSymbol(): void {
    const start = this.mark();
    const pair = this.source.slice(this.pos, this.pos + 2);
    const twoChar = TWO_CHAR_SYMBOLS.get(pair);
    if (twoChar !== undefined) {
      this.advance();
      this.advance();
      this.push(twoChar, start);
      return;
    }
    const char = this.advance();
    const oneChar = ONE_CHAR_SYMBOLS.get(char);
    if (oneChar !== undefined) this.push(oneChar, start);
    else this.bag.report(unknownCharacter(char), { ...start, end: this.pos });
  }

  /** The code point `offset` UTF-16 units ahead, or `''` past the end. */
  private peek(offset = 0): string {
    const code = this.source.codePointAt(this.pos + offset);
    return code === undefined ? '' : String.fromCodePoint(code);
  }

  private advance(): string {
    const char = this.peek();
    this.pos += char.length;
    if (char === '\n') {
      this.line += 1;
      this.column = 1;
    } else {
      this.column += 1;
    }
    return char;
  }

  private mark(): Mark {
    return { start: this.pos, line: this.line, column: this.column };
  }

  private push(kind: TokenKind, start: Mark, value?: string): void {
    this.tokens.push({
      kind,
      lexeme: this.source.slice(start.start, this.pos),
      ...start,
      end: this.pos,
      ...(value === undefined ? {} : { value }),
    });
  }
}

/** Never throws on bad input; always ends the token list with `EOF`. */
export function tokenize(source: string, options: TokenizeOptions = {}): TokenizeResult {
  const { file = DEFAULT_FILE, pack = hinglish } = options;
  return new Lexer(source, file, pack).scan();
}
