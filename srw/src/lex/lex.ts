import { tNumber, tReturn } from "@/lex/token-kind.ts"
import { makeAggregateMatcher } from "./generic/aggregate-matcher.ts"
import { makeFilterMuncher } from "./generic/filter-muncher.ts"
import { makeMuncher } from "./generic/muncher.ts"
import type { LexResult } from "./generic/result.ts"
import { makeStatefulLexer } from "./generic/stateful-lexer.ts"
import { allMatchers } from "./thy/all.ts"
import { Token } from "./token.ts"

export function lex(source: string): LexResult {
  const lexer = makeStatefulLexer(
    source,
    makeFilterMuncher(makeMuncher(makeAggregateMatcher(allMatchers)), [
      tReturn,
      tNumber,
    ]),
  )
  const tokens: Token[] = []
  let nextToken = lexer.getNextToken()
  while (nextToken) {
    tokens.push(nextToken)
    nextToken = lexer.getNextToken()
  }
  return { tokens }
}
