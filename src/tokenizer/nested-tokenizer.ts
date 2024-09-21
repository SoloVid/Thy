import type { CompileError } from "../common/compile-error"
import type { TokenMatcher } from "./token-matcher"
import type { tErrorToken, TokenType } from "./token-type"
import { makeGenericTokenizer } from "./tokenizer"
import type { TokenizerState } from "./tokenizer-state"

export function makeNestedTokenizerMatcher(
  firstTokenType: Exclude<TokenType, typeof tErrorToken>,
  firstTokenRegex: RegExp,
  finders: readonly TokenMatcher[],
  isDone: (state: TokenizerState) => boolean,
): TokenMatcher {
  return makeNestedDynamicTokenizerMatcher(
    firstTokenType,
    firstTokenRegex,
    () => finders,
    isDone,
  )
}

export function makeNestedDynamicTokenizerMatcher(
  firstTokenType: Exclude<TokenType, typeof tErrorToken>,
  firstTokenRegex: RegExp,
  makeFinders: (
    state: TokenizerState,
    firstTokenText: string,
  ) => readonly TokenMatcher[],
  isDone: (state: TokenizerState) => boolean,
): TokenMatcher {
  const statefulFirstTokenRegex = new RegExp(firstTokenRegex, "y")
  return (state: TokenizerState, errors: CompileError[]) => {
    statefulFirstTokenRegex.lastIndex = state.offset
    const match = statefulFirstTokenRegex.exec(state.text)
    if (match === null) {
      return null
    }
    return {
      type: firstTokenType,
      text: match[0],
      tokenizer: makeGenericTokenizer(
        makeFinders(state, match[0]),
        state,
        errors,
        () => isDone(state),
      ),
    }
  }
}
