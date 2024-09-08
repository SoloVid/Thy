import { checkExampleProgramTokens, testTokenizer } from "./test-helper"
import {
  tEndString, tStartString,
  tStatementTerminator,
  tStringText,
  tValueIdentifier
} from "./token-type"

testTokenizer("should tokenize Hello World", async () => {
  await checkExampleProgramTokens("hello-world.thy", [
    tValueIdentifier,
    tStartString,
    tStringText,
    tEndString,
    tStatementTerminator,
  ])
})
