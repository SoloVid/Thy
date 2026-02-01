import { debug } from "./debug.ts"
import type { TokenMatcherResult } from "./token-matcher.ts"
import {
  tComment,
  tEndBlock,
  tStartBlock,
  tStatementTerminator,
} from "./token-type.ts"
import type { TokenizerState } from "./tokenizer-state.ts"

function isStartOfLine(state: TokenizerState): boolean {
  return [null, tStatementTerminator, tStartBlock, tEndBlock].includes(
    state.lastTokenType,
  )
}

export function matchMultilineComment(
  state: TokenizerState,
): TokenMatcherResult {
  if (!isStartOfLine(state)) {
    return null
  }

  const regex = /[A-Z]{3,}(?=( .*)?\r?\n)/y
  regex.lastIndex = state.offset
  const openResult = regex.exec(state.text)
  if (openResult === null) {
    return null
  }

  const tag = openResult[0]
  const indentWidth = state.currentIndentWidth
  const fullCommentRegex = new RegExp(
    `(${tag})( .*)?\r?\n[\\S\\s]*?((^( {${indentWidth}})(${tag})$)|(.*$(?![\r\n])))`,
    "my",
  )
  debug("matching:", fullCommentRegex)
  fullCommentRegex.lastIndex = state.offset
  const result = fullCommentRegex.exec(state.text)
  if (result === null) {
    // TODO: May want to consume the rest of the input here and emit error about unclosed multiline comment.
    // I'm not actually sure this is possible to hit at present.
    // Note: The current implementation is limited by the lowest common
    // denominator that is TextMate grammars (VS Code syntax highlighting).
    // It does notprovide a way to pick a different highlighting strategy
    // for an unclosed multiline construct.
    return null
  }

  return {
    type: tComment,
    text: result[0],
  }
}

export function matchComment(state: TokenizerState): TokenMatcherResult {
  if (!isStartOfLine(state)) {
    return null
  }
  const regex = /[A-Z][^\r\n]*/y
  regex.lastIndex = state.offset
  const result = regex.exec(state.text)
  if (result === null) {
    return null
  }
  return {
    type: tComment,
    text: result[0],
  }
}
