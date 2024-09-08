import { checkExampleProgramTokens, testTokenizer } from "./test-helper"
import {
  tComment,
  tEndString,
  tStartString,
  tStatementTerminator,
  tStringText,
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
