import type { CompileError } from "../compile-error"
import { matchComment, matchMultilineComment } from "./comment"
import {
  matchMemberAccessOperator,
  matchTypeIdentifier,
  matchValueIdentifier,
} from "./identifier"
import { makeIndentMatchers } from "./indent"
import {
  matchAwait,
  matchConstDeclAssign,
  matchExport,
  matchGiven,
  matchLet,
  matchNoDeclAssign,
  matchPrivate,
  matchReturn,
  matchStatementContinuation,
  matchThat,
  matchType,
  matchVarDeclAssign,
} from "./keywords"
import { matchNumber } from "./number"
import {
  matchMultiLineStringLiteral,
  matchSimpleStringLiteral,
} from "./strings"
import { makeTokenHere } from "./token-helper"
import type { TokenMatcher } from "./token-matcher"
import { tEndBlock } from "./token-type"
import { makeGenericTokenizer, Tokenizer } from "./tokenizer"
import { makeTokenizerState } from "./tokenizer-state"
import { matchStatementTerminator, matchWhitespace } from "./whitespace"

export function makeTopTokenizer(
  source: string,
  errors: CompileError[],
): Tokenizer {
  const indentation = makeIndentMatchers()

  const state = makeTokenizerState(source)

  const finders: readonly TokenMatcher[] = [
    // indentation tokens must appear before Spaces, otherwise all indentation will always be consumed as spaces.
    // Outdent must appear before Indent for handling zero spaces outdents.
    indentation.matchOutdent,
    indentation.matchIndent,
    matchStatementContinuation,
    matchStatementTerminator,
    matchMultilineComment,
    matchComment,
    matchWhitespace,

    // Keywords
    matchConstDeclAssign,
    matchVarDeclAssign,
    matchNoDeclAssign,
    matchExport,
    matchPrivate,
    matchType,
    matchLet,

    // Semi-keywords
    matchAwait,
    matchGiven,
    matchReturn,
    matchThat,

    // Variable expressions
    matchNumber,
    matchMemberAccessOperator,
    matchTypeIdentifier,
    matchValueIdentifier,
    matchSimpleStringLiteral,
    matchMultiLineStringLiteral,
  ]

  const innerTokenizer = makeGenericTokenizer(
    finders,
    state,
    errors,
    () => !state.hasMoreText(),
  )

  let closingEndBlocks: null | number = null

  return {
    getNextToken() {
      let token = innerTokenizer.getNextToken()
      if (token === null) {
        if (closingEndBlocks === null) {
          closingEndBlocks = indentation.currentIndentLevels
        }
        if (closingEndBlocks > 0) {
          closingEndBlocks--
          return makeTokenHere(state, tEndBlock, "")
        }
        return null
      }
      return token
    },
  }
}
