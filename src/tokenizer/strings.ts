import { debug } from "./debug"
import { matchValueIdentifier } from "./identifier"
import {
  makeNestedDynamicTokenizerMatcher,
  makeNestedTokenizerMatcher,
} from "./nested-tokenizer"
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

const matchStringText = makeSingleRegexMatcher(
  tStringText,
  /(?:\\.|[^".\r\n]|(?:\.(?![a-z][a-zA-Z0-9]*\.)))+/,
)
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
    // Find the next line where either there is more whitespace indent than
    // the line with """, or where there is anything in addition to whitespace,
    // whichever comes first.
    const nextLineWithSignificantWhitespaceRegex = new RegExp(
      `^(?:(?:( {${parentIndent + 1},})[\r\n])|(?:( *)[^ \r\n]))`,
      "gm",
    )
    nextLineWithSignificantWhitespaceRegex.lastIndex = state.offset
    const significantWhitespaceMatch =
      nextLineWithSignificantWhitespaceRegex.exec(state.text)
    debug(() => [
      "match next line with significant whitespace:",
      significantWhitespaceMatch,
      nextLineWithSignificantWhitespaceRegex,
    ])
    let textContentIndent =
      significantWhitespaceMatch === null
        ? parentIndent
        : (significantWhitespaceMatch[1] || significantWhitespaceMatch[2] || "")
            .length
    // Some logic falls apart if no indent is found.
    if (textContentIndent <= parentIndent) {
      textContentIndent = parentIndent + 1
    }
    debug(() => ["text content indent:", textContentIndent])
    const matchContentNewLine = makeMultiLineStringNewLineContentMatcher(
      parentIndent,
      textContentIndent,
    )
    // End of the multi-line string is some number of empty lines
    // (space-count at most equal to the text content indent)
    // followed by a line at a lower indent level.
    const matchMultiLineStringLiteralEnd = makeSingleRegexMatcher(
      tEndString,
      new RegExp(
        `(?=(?:\r?\n {0,${textContentIndent}})*(?:(?:\r?\n {0,${parentIndent}}(?![ \r\n]))|$(?![\r\n])))`,
      ),
    )
    const matchMultiLineStringPrefixWhitespace = makeSingleRegexMatcher(
      skipToken,
      new RegExp(`^ {1,${textContentIndent}}`),
    )
    return [
      matchMultiLineStringLiteralEnd,
      matchMultiLineStringPrefixWhitespace,
      matchStringInterpolation,
      matchStringText,
      matchContentNewLine,
    ]
  },
  (state) => state.lastTokenType === tEndString,
)

export function makeMultiLineStringNewLineContentMatcher(
  parentIndent: number,
  textContentIndent: number,
): TokenMatcher {
  // Match a new line where, after some arbitrary lookahead, we run into a line
  // that either (A) is text content (has characters beyond text content indent)
  // or (B) represents a line of code after the multi-line string
  // (some indent no greater than parent indent with some non-whitespace character).
  const newLineLookAheadToNextLineWithTextContentRegex = new RegExp(
    `\r?\n(?=[\\S\\s]*?^(?:( {${textContentIndent},}.)|(?:( {0,${parentIndent}}[^ \r\n]))))`,
    "my",
  )
  return (state) => {
    newLineLookAheadToNextLineWithTextContentRegex.lastIndex = state.offset
    debug(() => ["matching:", newLineLookAheadToNextLineWithTextContentRegex])
    const result = newLineLookAheadToNextLineWithTextContentRegex.exec(
      state.text,
    )
    if (result === null || !result[1]) {
      return null
    }
    return {
      // If the last token was the start of the string, the new-line is just
      // part of the multi-line string opener, not content.
      // We don't just consume the new-line as part of the start string token
      // because it is needed for the statement terminator matcher.
      type:
        state.lastTokenType === tStartString && !state.lastTokenSkipped
          ? skipToken
          : tStringText,
      text: result[0],
    }
  }
}
