import { checkExampleProgramTokens, testTokenizer } from "./test-helper"
import {
  tComment,
  tEndString,
  tStartString,
  tStatementTerminator,
  tStringText,
  tTypeIdentifier,
  tValueIdentifier,
} from "./token-type"

testTokenizer("should tokenize Hello World", async () => {
  await checkExampleProgramTokens("hello-world.thy", [
    tComment,
    tStatementTerminator,
    tValueIdentifier,
    tStartString,
    tStringText,
    tEndString,
    tStatementTerminator,
    tStatementTerminator,
  ])
})

testTokenizer(
  "should tokenize example program types/arguments.thy",
  async () => {
    await checkExampleProgramTokens("types/arguments.thy", [
      tValueIdentifier,
      tTypeIdentifier,
      tTypeIdentifier,
      tValueIdentifier,
      tValueIdentifier,
      tStatementTerminator,
      tStatementTerminator,
    ])
  },
)
