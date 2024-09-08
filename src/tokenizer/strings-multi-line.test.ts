import { expect } from "expect"
import { checkExampleProgramTokens, testTokenizer } from "./test-helper"
import {
  tEndString, tStartString, tStatementTerminator,
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
    // [tStringText, expect.stringMatching(/himom\r?\n/)],
    tEndString,
    tStatementTerminator,
    [tValueIdentifier, "print"],
    tStartString,
    [tStringText, "Dear Mom,"],
    [tStringText, expect.stringMatching(/\r?\n/)],
    [tStringText, expect.stringMatching(/\r?\n/)],
    [tStringText, "I hope this letter finds you!"],
    // [tStringText, expect.stringMatching(/I hope this letter finds you!\r?\n/)],
    tEndString,
    tStatementTerminator,
  ])
})

