import { lex as lexGeneric } from "./generic/lex.ts"
import type { LexResult } from "./generic/result.ts"
import { makeThyLexer } from "./thy/lexer.ts"
import type { TokenKind } from "./thy/token-kind.ts"

export function lex(source: string): LexResult<TokenKind> {
  const lexer = makeThyLexer(source)
  return lexGeneric(lexer)
}
