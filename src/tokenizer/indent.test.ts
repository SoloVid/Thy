import { expect } from "expect"
import { checkSourceTokens, testTokenizer, tokenizeSource } from "./test-helper"
import {
  tEndBlock,
  tErrorToken,
  tStartBlock,
  tStatementTerminator,
  tValueIdentifier,
} from "./token-type"

testTokenizer("should tokenize indented blocks", () => {
  const source = `if condition1
  if condition2a
    if condition3
      do3
      do3b
  if condition2b
    do2b`
  checkSourceTokens(source, [
    [tValueIdentifier, "if"],
    tValueIdentifier,
    tStartBlock,
    [tValueIdentifier, "if"],
    tValueIdentifier,
    tStartBlock,
    [tValueIdentifier, "if"],
    tValueIdentifier,
    tStartBlock,
    [tValueIdentifier, "do3"],
    tStatementTerminator,
    [tValueIdentifier, "do3b"],
    tEndBlock,
    tEndBlock,
    tStatementTerminator,
    [tValueIdentifier, "if"],
    tValueIdentifier,
    tStartBlock,
    [tValueIdentifier, "do2b"],
    tEndBlock,
    tEndBlock,
  ])
})

testTokenizer("should error on bad outdent but gracefully recover", () => {
  const source = `if condition1
  if condition2
      print

    print
      print
    print
  print
`
  const { outputs, errors } = tokenizeSource(source)

  expect(outputs.map((t) => [t.type, t.text])).toEqual([
    [tValueIdentifier, "if"],
    [tValueIdentifier, "condition1"],
    [tStartBlock, expect.anything()],
    [tValueIdentifier, "if"],
    [tValueIdentifier, "condition2"],
    [tStartBlock, expect.anything()],
    [tValueIdentifier, "print"],
    [tErrorToken, ""],
    [tEndBlock, expect.anything()],
    [tStatementTerminator, expect.anything()],
    [tStartBlock, expect.anything()],
    [tValueIdentifier, "print"],
    [tStartBlock, expect.anything()],
    [tValueIdentifier, "print"],
    [tEndBlock, expect.anything()],
    [tStatementTerminator, expect.anything()],
    [tValueIdentifier, "print"],
    [tEndBlock, expect.anything()],
    [tStatementTerminator, expect.anything()],
    [tValueIdentifier, "print"],
    [tStatementTerminator, expect.anything()],
    [tEndBlock, expect.anything()],
  ])
  expect(errors).toEqual([
    expect.objectContaining({
      start: {
        column: 6,
        line: 2,
        offset: 41,
        text: "",
        type: "ErrorToken",
      },
      message: "invalid outdent at offset: 41 (line 4)",
    }),
  ])
})
