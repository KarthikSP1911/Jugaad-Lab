import { tokenize } from '../src/lexer/lexer.js';
import { parse } from '../src/parser/parser.js';

/** Lexes and parses only, so tests may use undeclared names. */
export function syntax(source: string, file?: string) {
  const options = file === undefined ? {} : { file };
  const lexed = tokenize(source, options);
  const parsed = parse(lexed.tokens, options);
  const diagnostics = [...lexed.diagnostics, ...parsed.diagnostics];
  return { ast: parsed.ast, diagnostics };
}
