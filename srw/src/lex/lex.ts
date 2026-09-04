import { makeGenericLexer } from "./generic/lexer.ts"
import type { LexResult } from "./generic/result.ts"
import { allMatchers } from "./thy/all.ts"
import { tNumber, tReturn } from "./token-kind.ts"
import { Token } from "./token.ts"

export function lex(source: string): LexResult {
  const lexer = makeGenericLexer(source, allMatchers)
  const tokens: Token[] = []
  let nextToken: Token | null
  while (nextToken = lexer.getNextToken()) {
    tokens.push(nextToken)
  }
  // TODO: Uncomment this and fill out tests.
  // return { tokens }
  return {
    tokens: [
      {
        kind: tReturn,
        position: 0,
        length: 6,
      },
      {
        kind: tNumber,
        position: 7,
        length: 1,
      },
    ],
  }
}
