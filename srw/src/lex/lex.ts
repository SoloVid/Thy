import type { LexResult } from "./generic/result.ts"
import { makeThyLexer } from "./thy/lexer.ts"
import { Token } from "./generic/token.ts"

export function lex(source: string): LexResult {
  const lexer = makeThyLexer(source)
  const tokens: Token[] = []
  let nextToken = lexer.getNextToken()
  while (nextToken) {
    tokens.push(nextToken)
    nextToken = lexer.getNextToken()
  }
  return { tokens }
}
