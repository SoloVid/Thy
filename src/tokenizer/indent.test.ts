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
    tStatementTerminator,
    tEndBlock,
    tStatementTerminator,
    tEndBlock,
    tStatementTerminator,
    [tValueIdentifier, "if"],
    tValueIdentifier,
    tStartBlock,
    [tValueIdentifier, "do2b"],
    tStatementTerminator,
    tEndBlock,
    tStatementTerminator,
    tEndBlock,
    tStatementTerminator,
  ])
})

testTokenizer("should tokenize outdents before extraneous new lines", () => {
  const source = `if condition1
  if condition2a
    if condition3
      do3


  if condition2b
    do2b

`
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
    tEndBlock,
    tStatementTerminator,
    tEndBlock,
    tStatementTerminator,
    tStatementTerminator,
    tStatementTerminator,
    [tValueIdentifier, "if"],
    tValueIdentifier,
    tStartBlock,
    [tValueIdentifier, "do2b"],
    tStatementTerminator,
    tEndBlock,
    tStatementTerminator,
    tEndBlock,
    tStatementTerminator,
    tStatementTerminator,
    tStatementTerminator,
  ])
})

testTokenizer("should error on bad outdent but gracefully recover", () => {
  const source = `if condition1
  if condition2
      print1

    print2
      print3
 print4
  print5
`
  const { outputs, errors } = tokenizeSource(source)

  // The specifics on how this token stream turns out are questionable,
  // but we can't very well interpret the intent of the programmer anyway.
  expect(outputs.map((t) => [t.type, t.text])).toEqual([
    [tValueIdentifier, "if"],
    [tValueIdentifier, "condition1"],
    [tStartBlock, expect.anything()],
    [tValueIdentifier, "if"],
    [tValueIdentifier, "condition2"],
    [tStartBlock, expect.anything()],
    [tValueIdentifier, "print1"],
    [tStatementTerminator, expect.anything()],
    [tEndBlock, expect.anything()],
    [tStatementTerminator, expect.anything()],
    [tStartBlock, expect.anything()],
    [tValueIdentifier, "print2"],
    [tStartBlock, expect.anything()],
    [tValueIdentifier, "print3"],
    [tStatementTerminator, expect.anything()],
    [tEndBlock, expect.anything()],
    [tStatementTerminator, expect.anything()],
    [tEndBlock, expect.anything()],
    [tStatementTerminator, expect.anything()],
    [tEndBlock, expect.anything()],
    [tStartBlock, expect.anything()],
    [tValueIdentifier, "print4"],
    [tStartBlock, expect.anything()],
    [tValueIdentifier, "print5"],
    [tStatementTerminator, expect.anything()],
    [tEndBlock, expect.anything()],
    [tStatementTerminator, expect.anything()],
    [tEndBlock, expect.anything()],
    [tStatementTerminator, expect.anything()],
    [tStatementTerminator, expect.anything()],
  ])
  expect(errors).toEqual([
    expect.objectContaining({
      start: {
        column: 6,
        line: 2,
        offset: 42,
        text: "",
        type: "ErrorToken",
      },
      message: "invalid outdent at offset: 42 (line 5)",
    }),
    expect.objectContaining({
      start: {
        column: 6,
        line: 5,
        offset: 67,
        text: "",
        type: "ErrorToken",
      },
      message: "invalid outdent at offset: 67 (line 7)",
    }),
  ])
})
