import { expect } from "expect"
import {
  tConstDeclAssign,
  tStatementTerminator,
  tValueIdentifier,
} from "tokenizer/token-type.ts"
import { getNodeStructure, testParser } from "./example-test/index.ts"
import { parseIdea } from "./parse-idea.ts"
import { makeParserTestFixture } from "./test-helper.ts"

testParser("parseIdea() should smooth out bad parse to comment", () => {
  const expectedFuncToken = {
    type: tValueIdentifier,
    text: "recoveredFunc",
  } as const
  const { errors, state } = makeParserTestFixture([
    tValueIdentifier,
    tConstDeclAssign,
    tConstDeclAssign,
    tValueIdentifier,
    tStatementTerminator,
    expectedFuncToken,
    tStatementTerminator,
  ])
  const result1 = parseIdea(state)
  const result2 = parseIdea(state)
  expect(errors.length).toBe(1)
  expect(getNodeStructure(result1)).toMatchObject({
    type: "comment",
  })
  expect(getNodeStructure(result2)).toMatchObject({
    type: "value-call",
    func: {
      type: "value-identifier",
      token: expectedFuncToken,
    },
  })
})
