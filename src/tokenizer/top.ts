import type { CompileError } from "../common/compile-error.ts"
import { matchComment, matchMultilineComment } from "./comment.ts"
import { debug } from "./debug.ts"
import {
  matchMemberAccessOperator,
  matchTypeIdentifier,
  matchValueIdentifier,
} from "./identifier.ts"
import { makeIndentMatchers } from "./indent.ts"
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
  matchThy,
  matchType,
  matchTypeGiven,
  matchVarDeclAssign,
} from "./keywords.ts"
import { matchNumber } from "./number.ts"
import {
  matchMultiLineStringLiteral,
  matchSimpleStringLiteral,
} from "./strings.ts"
import { makeTokenHere } from "./token-helper.ts"
import type { TokenMatcher } from "./token-matcher.ts"
import { tEndBlock, tEndStream, tStatementTerminator } from "./token-type.ts"
import { makeGenericTokenizer, Tokenizer } from "./tokenizer.ts"
import { makeTokenizerState } from "./tokenizer-state.ts"
import { matchStatementTerminator, matchWhitespace } from "./whitespace.ts"

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
    matchThy,
    matchThat,
    matchTypeGiven,

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
  let closingTerminators: null | number = null

  return {
    getNextToken() {
      let token = innerTokenizer.getNextToken()
      if (token.type === tEndStream) {
        if (closingTerminators === null) {
          closingTerminators = indentation.currentIndentLevels + 1
          debug(`statement terminators to close with:`, closingTerminators)
        }
        if (closingEndBlocks === null) {
          closingEndBlocks = indentation.currentIndentLevels
          debug(`end blocks to close with:`, closingEndBlocks)
        }
        if (closingTerminators > 0 && closingTerminators > closingEndBlocks) {
          closingTerminators--
          return makeTokenHere(state, tStatementTerminator, "")
        }
        if (closingEndBlocks > 0) {
          closingEndBlocks--
          return makeTokenHere(state, tEndBlock, "")
        }
      }
      return token
    },
  }
}
