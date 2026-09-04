import { tNumber, tReturn } from "@/lex/token-kind.ts"
import { combineMatchers } from "./generic/match/combine.ts"
import { filterMuncher } from "./generic/munch/filter.ts"
import { makeMuncher } from "./generic/munch/muncher.ts"
import type { LexResult } from "./generic/result.ts"
import { makeStatefulLexer } from "./generic/stateful-lexer.ts"
import { allMatchers } from "./thy/all.ts"
import { Token } from "./token.ts"

export function lex(source: string): LexResult {
  const lexer = makeStatefulLexer(
    source,
    filterMuncher(makeMuncher(combineMatchers(allMatchers)), [
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
