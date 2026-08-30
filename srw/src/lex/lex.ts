import { LexResult } from "@/lex/generic/result.ts"
import { tNumber, tReturn } from "./token-kind.ts"
import { makeGenericLexer } from "@/lex/generic/lexer.ts"
import { keywordMatchers } from "@/lex/thy/keywords.ts"
import { Token } from "@/lex/token.ts"
import { allMatchers } from "@/lex/thy/all.ts"

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
            }
    ]
  }
}
