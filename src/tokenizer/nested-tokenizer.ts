import type { CompileError } from "../compile-error"
import type { TokenMatcher } from "./token-matcher"
import type { TokenType } from "./token-type"
import { makeGenericTokenizer } from "./tokenizer"
import type { TokenizerState } from "./tokenizer-state"

export function makeNestedTokenizerMatcher(firstTokenType: TokenType, firstTokenRegex: RegExp, finders: readonly TokenMatcher[], isDone: (state: TokenizerState) => boolean): TokenMatcher {
  const statefulFirstTokenRegex = new RegExp(firstTokenRegex, 'y')
  return (state: TokenizerState, errors: CompileError[]) => {
    statefulFirstTokenRegex.lastIndex = state.offset
    const match = statefulFirstTokenRegex.exec(state.text)
    if (match === null) {
      return null
    }
    return {
      type: firstTokenType,
      text: match[0],
      tokenizer: makeGenericTokenizer(finders, state, errors, () => isDone(state))
    }
  }
}
