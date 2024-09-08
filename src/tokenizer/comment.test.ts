import { checkSourceTokens, testTokenizer } from "./test-helper"
import {
  tComment,
  tEndBlock,
  tStartBlock,
  tStatementTerminator,
  tValueIdentifier,
} from "./token-type"

testTokenizer("should tokenize single-line comments", () => {
  const source = `This is a comment
And another
print
And another
`
  checkSourceTokens(source, [
    [tComment, "This is a comment"],
    tStatementTerminator,
    [tComment, "And another"],
    tStatementTerminator,
    tValueIdentifier,
    tStatementTerminator,
    [tComment, "And another"],
    tStatementTerminator,
    tStatementTerminator,
  ])
})

testTokenizer("should allow single-line comments at end of file", () => {
  const source = `This is a comment`
  checkSourceTokens(source, [
    [tComment, "This is a comment"],
    tStatementTerminator,
  ])
})

testTokenizer("should tokenize multi-line comments", () => {
  const source = `notCommented
XYZ
commented
ABC
commented
XYZ
notCommented
`
  checkSourceTokens(source, [
    tValueIdentifier,
    tStatementTerminator,
    [
      tComment,
      `XYZ
commented
ABC
commented
XYZ`,
    ],
    tStatementTerminator,
    tValueIdentifier,
    tStatementTerminator,
    tStatementTerminator,
  ])
})

testTokenizer("should tokenize multi-line comments with prelude", () => {
  const source = `notCommented
XYZ Note: I wanted an extra note here
commented
ABC
commented
XYZ
notCommented
`
  checkSourceTokens(source, [
    tValueIdentifier,
    tStatementTerminator,
    [
      tComment,
      `XYZ Note: I wanted an extra note here
commented
ABC
commented
XYZ`,
    ],
    tStatementTerminator,
    tValueIdentifier,
    tStatementTerminator,
    tStatementTerminator,
  ])
})

testTokenizer("should tokenize multi-line comments with indentation", () => {
  const source = `notCommented
  XYZ
  commented
    Some inner comment
    commented
  XYZ
notCommented
`
  checkSourceTokens(source, [
    tValueIdentifier,
    tStartBlock,
    [
      tComment,
      `XYZ
  commented
    Some inner comment
    commented
  XYZ`,
    ],
    tStatementTerminator,
    tEndBlock,
    tStatementTerminator,
    tValueIdentifier,
    tStatementTerminator,
    tStatementTerminator,
  ])
})

// Note: This implementation is essentially just to keep everything consistent
// since TextMate grammars (VS Code syntax highlighting) don't provide a way
// to pick a different highlighting strategy for an unclosed multiline construct.
testTokenizer(
  "should slurp up everything after unclosed multi-line comment opener",
  () => {
    const source = `notCommented
  XYZ
commented
ABC
commented
XYZ
unfortunatelyStillCommented
`
    checkSourceTokens(source, [
      tValueIdentifier,
      tStartBlock,
      [
        tComment,
        `XYZ
commented
ABC
commented
XYZ
unfortunatelyStillCommented
`,
      ],
      tStatementTerminator,
      tEndBlock,
      tStatementTerminator,
    ])
  },
)
