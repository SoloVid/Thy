import { debug } from "./debug"
import { matchValueIdentifier } from "./identifier"
import { makeNestedDynamicTokenizerMatcher, makeNestedTokenizerMatcher } from "./nested-tokenizer"
import { makeSingleRegexMatcher } from "./single-regex-matcher"
import { skipToken, TokenMatcher } from "./token-matcher"
import {
  tEndString,
  tEndStringInterpolation,
  tStartString,
  tStartStringInterpolation,
  tStringText,
} from "./token-type"

const matchStringInterpolationEnd = makeSingleRegexMatcher(
  tEndStringInterpolation,
  /\./,
)
export const matchStringInterpolation = makeNestedTokenizerMatcher(
  tStartStringInterpolation,
  /\.(?=[a-z][a-zA-Z0-9]*\.)/,
  [matchValueIdentifier, matchStringInterpolationEnd],
  (state) => state.lastTokenType === tEndStringInterpolation,
)

const matchStringText = makeSingleRegexMatcher(tStringText, /(?:\\.|[^".\r\n]|(?:\.(?![a-z][a-zA-Z0-9]*\.)))+/)
const matchSimpleStringLiteralEnd = makeSingleRegexMatcher(tEndString, /"/)
export const matchSimpleStringLiteral = makeNestedTokenizerMatcher(
  tStartString,
  /"(?!"")/,
  [matchStringInterpolation, matchStringText, matchSimpleStringLiteralEnd],
  (state) => state.lastTokenType === tEndString,
)

export const matchMultiLineStringLiteral = makeNestedDynamicTokenizerMatcher(
  tStartString,
  /"""/,
  (state) => {
    const parentIndent = state.currentIndentWidth
    const nextLineWithSignificantWhitespaceRegex = new RegExp(`^(?:(?:( {${parentIndent + 1},})[\r\n])|(?:( *)[^ \r\n]))`, "gm")
    nextLineWithSignificantWhitespaceRegex.lastIndex = state.offset
    const significantWhitespaceMatch = nextLineWithSignificantWhitespaceRegex.exec(state.text)
    debug(() => ["match next line with significant whitespace:", significantWhitespaceMatch, nextLineWithSignificantWhitespaceRegex])
    let indentToStrip = significantWhitespaceMatch === null ? parentIndent : (significantWhitespaceMatch[1] || significantWhitespaceMatch[2] || "").length
    if (indentToStrip <= parentIndent) {
      indentToStrip = parentIndent + 1
    }
    debug(() => ["indent to strip:", indentToStrip])
    const matchStringTextMultiLine = makeSingleRegexMatcher(tStringText, new RegExp(`(?:\\.|[^".\r\n]|(?:\.(?![a-z][a-zA-Z0-9]*\.)))+(?:\r?\n(?= {${indentToStrip}}[^\r\n]))?`))
    const matchContentEmptyLine = makeSingleRegexMatcher(tStringText, new RegExp(`\r?\n(?= {${indentToStrip}}[^\r\n])`))
    const matchContentNewLine = makeMultiLineStringNewLineContentMatcher(parentIndent, indentToStrip)
    const matchMultiLineStringLiteralEnd = makeSingleRegexMatcher(tEndString, new RegExp(`(?:\r?\n {0,${indentToStrip}})*(?=\r?\n {${parentIndent}}(?![ \r\n]))`))
    if (indentToStrip > 0) {
    const matchMultiLineStringPrefixWhitespace = makeSingleRegexMatcher(skipToken, new RegExp(`^ {1,${indentToStrip}}`))
    return [matchMultiLineStringLiteralEnd, matchMultiLineStringPrefixWhitespace, matchStringInterpolation, matchStringText, matchContentNewLine]
    }
    return [matchMultiLineStringLiteralEnd, matchStringInterpolation, matchStringText, matchContentNewLine]
  },
  (state) => state.lastTokenType === tEndString,
)

export function makeMultiLineStringNewLineContentMatcher(
  parentIndent: number,
  indentToStrip: number,
): TokenMatcher {
  const newLineLookAheadToNextLineWithTextContentRegex = new RegExp(`\r?\n(?=[\\S\\s]*?^(?:( {${indentToStrip},}.)|(?:( {0,${parentIndent}}[^ \r\n]))))`, "my")
  return (state) => {
    // if (state.lastTokenType === tStartString) {
    //   debug(() => ["last token was string start; so skipping new-line matcher"])
    //   return {
    //     type: skipToken,
    //     text: 
    //   }
    // }
    newLineLookAheadToNextLineWithTextContentRegex.lastIndex = state.offset
    debug(() => ["matching:", newLineLookAheadToNextLineWithTextContentRegex])
    const result = newLineLookAheadToNextLineWithTextContentRegex.exec(state.text)
    if (result === null || !result[1]) {
      return null
    }
    return {
      type: state.lastTokenType === tStartString ? skipToken : tStringText,
      text: result[0],
    }
  }
}

