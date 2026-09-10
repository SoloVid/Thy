import { tNumber, TokenKind, tReturn } from "./token-kind.ts"
import { Lexer } from "../generic/lexer.ts"
import { combineMatchers } from "../generic/match/combine.ts"
import { filterMuncher } from "../generic/munch/filter.ts"
import { makeMuncher } from "../generic/munch/muncher.ts"
import { makeStatefulLexer } from "../generic/stateful-lexer.ts"
import { allMatchers } from "./match/all.ts"

/**
 * Make a lexer specifically tailored for Thy.
 */
export function makeThyLexer(source: string): Lexer<TokenKind> {
  return makeStatefulLexer(
    source,
    filterMuncher(makeMuncher(combineMatchers(allMatchers)), [
      tReturn,
      tNumber,
    ] as const),
  )
}
