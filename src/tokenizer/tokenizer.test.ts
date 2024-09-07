import { checkExampleProgramTokenTypes, testTokenizer } from "./test-helper"
import { tEndBlock, tEndString, tStartBlock, tStartString, tStatementTerminator, tStringText, tValueIdentifier } from "./token-type"

testTokenizer("should tokenize Hello World", async () => {
  await checkExampleProgramTokenTypes("hello-world.thy", [
    tStartBlock,
    tValueIdentifier,
    tStartString,
    tStringText,
    tEndString,
    tStatementTerminator,
    tEndBlock
  ])
})
