import assert from "../utils/assert"
import type { TokenMatcher } from "./token-matcher"
import { tEndBlock, tErrorToken, tStartBlock } from "./token-type"
import type { TokenizerState } from "./tokenizer-state"

export interface IndentTokenizers {
  matchIndent: TokenMatcher
  matchOutdent: TokenMatcher
  readonly currentIndentLevels: number
}

export function makeIndentMatchers(): IndentTokenizers {
  // State required for matching the indentations
  const indentStack = [0]

  function matchIndent(state: TokenizerState) {
    const regex = /(?:\r?\n)( *(?=[^ \r\n]))/y
    regex.lastIndex = state.offset
    const match = regex.exec(state.text)
    if (match === null) {
      return null
    }

    const currIndentLevel = match[1].length
    const prevIndentLevel = indentStack[indentStack.length - 1]

    // Indentation is not deeper; so it isn't an indent.
    if (currIndentLevel <= prevIndentLevel) {
      return null
    }

    indentStack.push(currIndentLevel)
    return {
      type: tStartBlock,
      text: match[0],
    } as const
  }

  let lastOutdentOffset = -1
  let outdentsOutstanding = 0

  const outdentResult = {
    type: tEndBlock,
    text: "",
  } as const

  function matchOutdent(state: TokenizerState) {
    if (outdentsOutstanding > 0) {
      indentStack.pop()
      outdentsOutstanding--
      return outdentResult
    }

    // We're often not consuming anything but just generating tokens.
    // In that case, we don't want to infinitely generate tokens.
    if (lastOutdentOffset >= state.offset) {
      return null
    }
    lastOutdentOffset = state.offset

    // const regex = /(?<=\n)( *(?=[^ \r\n]))/y
    const regex = /\r?\n([ \r\n]*(?=[^ \r\n]))/y
    regex.lastIndex = state.offset
    const match = regex.exec(state.text)
    if (match === null) {
      return null
    }

    const lines = match[1].split("\n")
    assert(
      lines.length !== 0,
      "regex match should have returned at least one line",
    )
    const lastLineIndentation = lines[lines.length - 1]
    const currIndentLevel = lastLineIndentation.length
    const prevIndentLevel = indentStack[indentStack.length - 1]

    // Indentation is not shallower, so it isn't an outdent.
    if (currIndentLevel >= prevIndentLevel) {
      return null
    }

    const matchIndentIndex = indentStack.lastIndexOf(currIndentLevel)

    // Any outdent must match some previous indentation level.
    if (matchIndentIndex === -1) {
      // If we're in this state, flag an error and try popping off a layer
      // of indent to see if that gets us into a recovered state.
      outdentsOutstanding = 1
      return {
        type: tErrorToken,
        text: "",
        error: `invalid outdent at offset: ${state.offset} (line ${state.line + lines.length})`,
      } as const
    }

    const numOutdents = indentStack.length - matchIndentIndex - 1

    // Since we can only return one token, queue up "matches" for the next round.
    outdentsOutstanding = numOutdents - 1

    indentStack.pop()
    return outdentResult
  }

  return {
    matchIndent: matchIndent,
    matchOutdent: matchOutdent,
    get currentIndentLevels() {
      return indentStack.length - 1
    },
  }
}
