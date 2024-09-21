import { expect } from "expect"
import { testTokenizer, tokenizeSource } from "./test-helper"
import {
  tErrorToken,
  tMemberAccessOperator,
  tStatementTerminator,
  tValueIdentifier,
} from "./token-type"

testTokenizer("can return error tokens and recover", () => {
  const source = "crash !$@ recover"
  const { outputs, errors } = tokenizeSource(source)

  expect(outputs.map((t) => [t.type, t.text])).toEqual([
    [tValueIdentifier, "crash"],
    [tErrorToken, "!$@"],
    [tValueIdentifier, "recover"],
    [tStatementTerminator, expect.anything()],
  ])
  expect(errors).toEqual([
    {
      end: {
        column: 6,
        line: 0,
        offset: 6,
        text: "!$@",
        type: "ErrorToken",
      },
      message: "Unexpected token",
      start: {
        column: 6,
        line: 0,
        offset: 6,
        text: "!$@",
        type: "ErrorToken",
      },
    },
  ])
})

testTokenizer("barfs if identifier is invalid", async () => {
  const source = "$x"
  const { outputs, errors } = tokenizeSource(source)

  expect(outputs.map((t) => [t.type, t.text])).toEqual([
    [tErrorToken, "$"],
    [tValueIdentifier, "x"],
    [tStatementTerminator, expect.anything()],
  ])
  expect(errors).toEqual([
    {
      end: {
        column: 0,
        line: 0,
        offset: 0,
        text: "$",
        type: "ErrorToken",
      },
      message: "Unexpected token",
      start: {
        column: 0,
        line: 0,
        offset: 0,
        text: "$",
        type: "ErrorToken",
      },
    },
  ])
})

testTokenizer("barfs if member access is invalid", async () => {
  const source = `x.$y.z`
  const { outputs, errors } = tokenizeSource(source)

  expect(outputs.map((t) => [t.type, t.text])).toEqual([
    [tValueIdentifier, "x"],
    [tErrorToken, ".$"],
    [tValueIdentifier, "y"],
    [tMemberAccessOperator, "."],
    [tValueIdentifier, "z"],
    [tStatementTerminator, expect.anything()],
  ])
  expect(errors).toEqual([
    {
      end: {
        column: 1,
        line: 0,
        offset: 1,
        text: ".$",
        type: "ErrorToken",
      },
      message: "Unexpected token",
      start: {
        column: 1,
        line: 0,
        offset: 1,
        text: ".$",
        type: "ErrorToken",
      },
    },
  ])
})
