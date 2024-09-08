import { expect } from "expect"
import { checkExampleProgramTokens, checkSourceTokens, testTokenizer } from "./test-helper"
import {
  tConstDeclAssign, tEndString, tEndStringInterpolation, tStartString, tStartStringInterpolation, tStatementTerminator,
  tStringText,
  tValueIdentifier
} from "./token-type"

testTokenizer("should tokenize simple multi-line strings correctly", async () => {
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
  ])
})

testTokenizer("should tokenize multi-line strings with escapes correctly", async () => {
  await checkExampleProgramTokens("strings/multi-line/escapes.thy", [
    [tValueIdentifier, "print"],
    tStartString,
    [tStringText, "Some \\\"tea\\\" for you?"],
    tEndString,
    tStatementTerminator,
    [tValueIdentifier, "print"],
    tStartString,
    [tStringText, "like \\.name\\."],
    tEndString,
    tStatementTerminator,
  ])
})

testTokenizer("should tokenize multi-line strings with interpolations correctly", async () => {
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
  ])
})

testTokenizer("should tokenize multi-line string with leading new lines (1)", async () => {
  const source = `print """

  himom
`
  await checkSourceTokens(source, [
    [tValueIdentifier, "print"],
    tStartString,
    [tStringText, expect.stringMatching(/\r?\n/)],
    [tStringText, "himom"],
    tEndString,
    tStatementTerminator,
  ])
})

testTokenizer("should tokenize multi-line string with leading new lines (2)", async () => {
  const source = `print """
  
  himom
`
  await checkSourceTokens(source, [
    [tValueIdentifier, "print"],
    tStartString,
    [tStringText, expect.stringMatching(/\r?\n/)],
    [tStringText, "himom"],
    tEndString,
    tStatementTerminator,
  ])
})

testTokenizer("should tokenize multi-line string with leading new lines (3)", async () => {
  const source = `print """

  

  himom
`
  await checkSourceTokens(source, [
    [tValueIdentifier, "print"],
    tStartString,
    [tStringText, expect.stringMatching(/\r?\n/)],
    [tStringText, expect.stringMatching(/\r?\n/)],
    [tStringText, expect.stringMatching(/\r?\n/)],
    [tStringText, "himom"],
    tEndString,
    tStatementTerminator,
  ])
})

testTokenizer("should tokenize multi-line string, ignoring trailing new lines (1)", async () => {
  const source = `print """
  himom

`
  await checkSourceTokens(source, [
    [tValueIdentifier, "print"],
    tStartString,
    [tStringText, "himom"],
    tEndString,
    tStatementTerminator,
    tStatementTerminator,
  ])
})

testTokenizer("should tokenize multi-line string, ignoring trailing new lines (2)", async () => {
  const source = `print """
  himom
  
`
  await checkSourceTokens(source, [
    [tValueIdentifier, "print"],
    tStartString,
    [tStringText, "himom"],
    tEndString,
    tStatementTerminator,
    tStatementTerminator,
  ])
})

testTokenizer("should tokenize multi-line string, ignoring trailing new lines (3)", async () => {
  const source = `print """
  himom

  

`
  await checkSourceTokens(source, [
    [tValueIdentifier, "print"],
    tStartString,
    [tStringText, "himom"],
    tEndString,
    tStatementTerminator,
    tStatementTerminator,
    tStatementTerminator,
    tStatementTerminator,
  ])
})

testTokenizer("should tokenize multi-line string, ignoring trailing new lines (4)", async () => {
  const source = `print """
  himom

  

print "done"
`
  await checkSourceTokens(source, [
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
  ])
})

testTokenizer("should tokenize multi-line string, allowing immediate end of file", async () => {
  const source = `print """
  himom`
  await checkSourceTokens(source, [
    [tValueIdentifier, "print"],
    tStartString,
    [tStringText, "himom"],
    tEndString,
    tStatementTerminator,
  ])
})
