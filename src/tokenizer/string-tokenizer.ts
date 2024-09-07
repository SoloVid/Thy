import type { CompileError } from "../compile-error";
import { valueIdentifierTokenizer } from "./identifier-tokenizer";
import { makeSingleRegexTokenizer } from "./single-regex-tokenizer";
import type { TokenFinder } from "./single-tokenizer";
import { tEndString, tEndStringInterpolation, TokenType, tStartString, tStartStringInterpolation, tStringText } from "./token-type";
import { makeTokenizer } from "./tokenizer";
import type { TokenizerState } from "./tokenizer-state";

const stringInterpolationEndTokenizer = makeSingleRegexTokenizer(tEndStringInterpolation, /\./)
export const stringInterpolationTokenizer = makeMultiRegexTokenizer(tStartStringInterpolation, /\.(?=[a-z][a-zA-Z0-9]*\.)/, [
  valueIdentifierTokenizer,
  stringInterpolationEndTokenizer,
], (state) => state.lastTokenType === tEndStringInterpolation)

const stringTextTokenizer = makeSingleRegexTokenizer(tStringText, /(?:\\.|[^".])+/)
const simpleStringLiteralEndTokenizer = makeSingleRegexTokenizer(tEndString, /"/)
export const simpleStringLiteralTokenizer = makeMultiRegexTokenizer(tStartString, /"(?!"")/, [
  stringTextTokenizer,
  simpleStringLiteralEndTokenizer,
  stringInterpolationTokenizer,
], (state) => state.lastTokenType === tEndString)

export function makeMultiRegexTokenizer(firstTokenType: TokenType, firstTokenRegex: RegExp, finders: readonly TokenFinder[], isDone: (state: TokenizerState) => boolean): TokenFinder {
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
      tokenizer: makeTokenizer(finders, state, errors, () => isDone(state))
    }
  }
}
