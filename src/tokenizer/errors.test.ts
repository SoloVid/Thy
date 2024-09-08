import { expect } from "expect"
import { testTokenizer, tokenizeSource } from "./test-helper"
import { tErrorToken, tValueIdentifier } from "./token-type"

testTokenizer("can return error tokens and recover", () => {
  const source = "crash !$@ recover"
  const { outputs, errors } = tokenizeSource(source)

  expect(outputs.map((t) => [t.type, t.text])).toEqual([
    [tValueIdentifier, "crash"],
    [tErrorToken, "!$@"],
    [tValueIdentifier, "recover"],
  ])
  expect(errors).toEqual([
    {
      end: {
        column: 0,
        line: 0,
        offset: 6,
        text: "!$@",
        type: "ErrorToken",
      },
      message: "Unexpected token",
      start: {
        column: 0,
        line: 0,
        offset: 6,
        text: "!$@",
        type: "ErrorToken",
      },
    },
  ])
})
