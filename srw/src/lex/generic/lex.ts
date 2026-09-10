import type { Lexer } from "./lexer.ts"
import type { LexResult } from "./result.ts"
import type { Token } from "./token.ts"

export function lex<TokenKind extends string = string>(
  lexer: Lexer<TokenKind>,
): LexResult<TokenKind> {
  const tokens: Token<TokenKind>[] = []
  let nextToken = lexer.getNextToken()
  while (nextToken) {
    tokens.push(nextToken)
    nextToken = lexer.getNextToken()
  }
  return { tokens }
}
