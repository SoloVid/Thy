import { expect } from "expect"
import {
  checkExampleProgramTokens,
  checkSourceTokens,
  testTokenizer,
} from "./test-helper"
import {
  tConstDeclAssign,
  tEndBlock,
  tEndString,
  tEndStringInterpolation,
  tMemberAccessOperator,
  tStartBlock,
  tStartString,
  tStartStringInterpolation,
  tStatementContinuation,
  tStatementTerminator,
  tStringText,
  tValueIdentifier,
} from "./token-type"

testTokenizer(
  "should tokenize simple multi-line strings correctly",
  async () => {
    await checkExampleProgramTokens("strings/multi-line/simple.thy", [
      [tValueIdentifier, "print"],
      tStartString,
      tEndString,
      tStatementTerminator,
      [tValueIdentifier, "print"],
      tStartString,
      [tStringText, "himom"],
      tEndString,
      tStatementTerminator,
      [tValueIdentifier, "print"],
      tStartString,
      [tStringText, "Dear Mom,"],
      [tStringText, expect.stringMatching(/\r?\n/)],
      [tStringText, expect.stringMatching(/\r?\n/)],
      [tStringText, "I hope this letter finds you!"],
      tEndString,
      tStatementTerminator,
      tStatementTerminator,
    ])
  },
)

testTokenizer(
  "should tokenize multi-line strings with escapes correctly",
  async () => {
    await checkExampleProgramTokens("strings/multi-line/escapes.thy", [
      [tValueIdentifier, "print"],
      tStartString,
      [tStringText, 'Some \\"tea\\" for you?'],
      tEndString,
      tStatementTerminator,
      [tValueIdentifier, "print"],
      tStartString,
      [tStringText, "like \\.name\\."],
      tEndString,
      tStatementTerminator,
      tStatementTerminator,
    ])
  },
)

testTokenizer(
  "should tokenize multi-line strings with interpolations correctly",
  async () => {
    await checkExampleProgramTokens("strings/multi-line/interpolation.thy", [
      [tValueIdentifier, "name1"],
      tConstDeclAssign,
      [tValueIdentifier, "def"],
      tStartString,
      tStringText,
      tEndString,
      tStatementTerminator,
      [tValueIdentifier, "print"],
      tStartString,
      tStartStringInterpolation,
      [tValueIdentifier, "name1"],
      tEndStringInterpolation,
      tEndString,
      tStatementTerminator,
      [tValueIdentifier, "print"],
      tStartString,
      [tStringText, "Greetings, "],
      tStartStringInterpolation,
      [tValueIdentifier, "name1"],
      tEndStringInterpolation,
      [tStringText, "!"],
      tEndString,
      tStatementTerminator,
      [tValueIdentifier, "name2"],
      tConstDeclAssign,
      [tValueIdentifier, "def"],
      tStartString,
      tStringText,
      tEndString,
      tStatementTerminator,
      [tValueIdentifier, "print"],
      tStartString,
      [tStringText, "both "],
      tStartStringInterpolation,
      [tValueIdentifier, "name1"],
      tEndStringInterpolation,
      [tStringText, " and "],
      tStartStringInterpolation,
      [tValueIdentifier, "name2"],
      tEndStringInterpolation,
      tEndString,
      tStatementTerminator,
      tStatementTerminator,
    ])
  },
)

testTokenizer(
  "should tokenize multi-line string with leading new lines (1)",
  () => {
    const source = `print """

  himom
`
    checkSourceTokens(source, [
      [tValueIdentifier, "print"],
      tStartString,
      [tStringText, expect.stringMatching(/\r?\n/)],
      [tStringText, "himom"],
      tEndString,
      tStatementTerminator,
      tStatementTerminator,
    ])
  },
)

testTokenizer(
  "should tokenize multi-line string with leading new lines (2)",
  () => {
    const source = `print """
  
  himom
`
    checkSourceTokens(source, [
      [tValueIdentifier, "print"],
      tStartString,
      [tStringText, expect.stringMatching(/\r?\n/)],
      [tStringText, "himom"],
      tEndString,
      tStatementTerminator,
      tStatementTerminator,
    ])
  },
)

testTokenizer(
  "should tokenize multi-line string with leading new lines (3)",
  () => {
    const source = `print """

  

  himom
`
    checkSourceTokens(source, [
      [tValueIdentifier, "print"],
      tStartString,
      [tStringText, expect.stringMatching(/\r?\n/)],
      [tStringText, expect.stringMatching(/\r?\n/)],
      [tStringText, expect.stringMatching(/\r?\n/)],
      [tStringText, "himom"],
      tEndString,
      tStatementTerminator,
      tStatementTerminator,
    ])
  },
)

testTokenizer(
  "should tokenize multi-line string, ignoring trailing new lines (1)",
  () => {
    const source = `print """
  himom

`
    checkSourceTokens(source, [
      [tValueIdentifier, "print"],
      tStartString,
      [tStringText, "himom"],
      tEndString,
      tStatementTerminator,
      tStatementTerminator,
      tStatementTerminator,
    ])
  },
)

testTokenizer(
  "should tokenize multi-line string, ignoring trailing new lines (2)",
  () => {
    const source = `print """
  himom
  
`
    checkSourceTokens(source, [
      [tValueIdentifier, "print"],
      tStartString,
      [tStringText, "himom"],
      tEndString,
      tStatementTerminator,
      tStatementTerminator,
      tStatementTerminator,
    ])
  },
)

testTokenizer(
  "should tokenize multi-line string, ignoring trailing new lines (3)",
  () => {
    const source = `print """
  himom

  

`
    checkSourceTokens(source, [
      [tValueIdentifier, "print"],
      tStartString,
      [tStringText, "himom"],
      tEndString,
      tStatementTerminator,
      tStatementTerminator,
      tStatementTerminator,
      tStatementTerminator,
      tStatementTerminator,
    ])
  },
)

testTokenizer(
  "should tokenize multi-line string, ignoring trailing new lines (4)",
  () => {
    const source = `print """
  himom

  

print "done"
`
    checkSourceTokens(source, [
      [tValueIdentifier, "print"],
      tStartString,
      [tStringText, "himom"],
      tEndString,
      tStatementTerminator,
      tStatementTerminator,
      tStatementTerminator,
      tStatementTerminator,
      [tValueIdentifier, "print"],
      tStartString,
      [tStringText, "done"],
      tEndString,
      tStatementTerminator,
      tStatementTerminator,
    ])
  },
)

testTokenizer(
  "should tokenize multi-line string, allowing immediate end of file (1)",
  () => {
    const source = `print """
  himom`
    checkSourceTokens(source, [
      [tValueIdentifier, "print"],
      tStartString,
      [tStringText, "himom"],
      tEndString,
      tStatementTerminator,
    ])
  },
)

testTokenizer(
  "should tokenize multi-line string, allowing immediate end of file (2)",
  () => {
    const source = `print """`
    checkSourceTokens(source, [
      [tValueIdentifier, "print"],
      tStartString,
      tEndString,
      tStatementTerminator,
    ])
  },
)

testTokenizer(
  "should tokenize multi-line strings in indented blocks (1)",
  () => {
    const source = `if true
  print """
    himom
`
    checkSourceTokens(source, [
      tValueIdentifier,
      tValueIdentifier,
      tStartBlock,
      [tValueIdentifier, "print"],
      tStartString,
      [tStringText, "himom"],
      tEndString,
      tStatementTerminator,
      tEndBlock,
      tStatementTerminator,
      tStatementTerminator,
    ])
  },
)

testTokenizer(
  "should tokenize multi-line strings in indented blocks (2)",
  () => {
    const source = `if true
  print """
    himom
  print
`
    checkSourceTokens(source, [
      tValueIdentifier,
      tValueIdentifier,
      tStartBlock,
      [tValueIdentifier, "print"],
      tStartString,
      [tStringText, "himom"],
      tEndString,
      tStatementTerminator,
      tValueIdentifier,
      tStatementTerminator,
      tEndBlock,
      tStatementTerminator,
      tStatementTerminator,
    ])
  },
)

testTokenizer(
  "should tokenize multi-line strings in indented blocks (3)",
  () => {
    const source = `if true
  print """
    himom
print
`
    checkSourceTokens(source, [
      tValueIdentifier,
      tValueIdentifier,
      tStartBlock,
      [tValueIdentifier, "print"],
      tStartString,
      [tStringText, "himom"],
      tEndString,
      tStatementTerminator,
      tEndBlock,
      tStatementTerminator,
      tValueIdentifier,
      tStatementTerminator,
      tStatementTerminator,
    ])
  },
)

testTokenizer(
  "should tokenize multi-line strings involved with statement continuation (1)",
  () => {
    const source = `if true
  check.equal """
    himom
  and """
    himom
`
    checkSourceTokens(source, [
      tValueIdentifier,
      tValueIdentifier,
      tStartBlock,
      tValueIdentifier,
      tMemberAccessOperator,
      tValueIdentifier,
      tStartString,
      [tStringText, "himom"],
      tEndString,
      tStatementContinuation,
      tStartString,
      [tStringText, "himom"],
      tEndString,
      tStatementTerminator,
      tEndBlock,
      tStatementTerminator,
      tStatementTerminator,
    ])
  },
)

testTokenizer(
  "should tokenize multi-line strings involved with statement continuation (2)",
  () => {
    const source = `if true
  print """
    himom
and else
  print
`
    checkSourceTokens(source, [
      tValueIdentifier,
      tValueIdentifier,
      tStartBlock,
      tValueIdentifier,
      tStartString,
      [tStringText, "himom"],
      tEndString,
      tStatementTerminator,
      tEndBlock,
      tStatementContinuation,
      tValueIdentifier,
      tStartBlock,
      [tValueIdentifier, "print"],
      tStatementTerminator,
      tEndBlock,
      tStatementTerminator,
      tStatementTerminator,
    ])
  },
)
