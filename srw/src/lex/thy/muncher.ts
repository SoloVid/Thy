import { combineMatchers } from "../generic/match/combine.ts"
import { filterMuncher } from "../generic/munch/filter.ts"
import { makeMuncher, Muncher } from "../generic/munch/muncher.ts"
import { allMatchers } from "./match/all.ts"
import {
  tNumber,
  TokenKind,
  tReturn,
  tStatementTerminator,
} from "./token-kind.ts"

/**
 * Make a lexer specifically tailored for Thy.
 */
export function makeThyMuncher(): Muncher<TokenKind> {
  return filterMuncher(
    makeMuncher(combineMatchers(allMatchers)),
    [
      tStatementTerminator,
      tReturn,
      tNumber,
    ] as const,
  )
}
