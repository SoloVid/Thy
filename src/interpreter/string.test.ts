import type { CompileError } from "common/compile-error"
import { expect } from "expect"
import assert from "node:assert"
import { badParse } from "parser/error"
import { parseStringLiteral } from "parser/parse-string"
import { makeParserState } from "parser/parser-state"
import { test } from "test-framework"
import { makeTokenizer } from "tokenizer"
import { InterpreterErrorWithContext } from "./interpreter-error"
import { interpretThyString } from "./string"
import { makeSimpleContext } from "./test-helper"
import type { ThyBlockContext } from "./types"

function interpretString(context: ThyBlockContext, source: string) {
  const errors: CompileError[] = []
  const tokenizer = makeTokenizer(`"${source}"`, errors)
  const parserState = makeParserState(tokenizer, errors)
  const output = parseStringLiteral(parserState)
  expect(errors).toEqual([])
  assert(output !== badParse, `Parser should not have errored`)
  return interpretThyString(context, output)
}

test("interpolateString() should interpolate string values", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { a: "1", b: "2" },
  })
  assert.strictEqual(
    interpretString(context, "check ..a.. ..b.. and ..b....a.."),
    "check 1 2 and 21",
  )
})

test("interpolateString() should interpolate number values", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { a: 1, b: 2.3 },
  })
  assert.strictEqual(
    interpretString(context, "check ..a.. ..b.. and ..b....a.."),
    "check 1 2.3 and 2.31",
  )
})

function testRejectValue(value: unknown) {
  const context = makeSimpleContext({
    variablesInBlock: { a: value },
  })
  assert.throws(
    () => interpretString(context, "check ..a.."),
    (e) => {
      assert(e instanceof Error)
      assert.match(e.message, /a is not a string or number/)
      assert(e instanceof InterpreterErrorWithContext)
      assert.deepStrictEqual(e.sourceLocation, { line: 0, column: 9 })
      return true
    },
  )
}

test("interpretThyString() should reject boolean value for interpolation", async () => {
  testRejectValue(true)
})

test("interpretThyString() should reject null value for interpolation", async () => {
  testRejectValue(null)
})

test("interpretThyString() should reject undefined value for interpolation", async () => {
  testRejectValue(undefined)
})

test("interpretThyString() should reject object value for interpolation", async () => {
  testRejectValue({})
})

test("interpretThyString() should reject array value for interpolation", async () => {
  testRejectValue([])
})

test("interpretThyString() should reject function value for interpolation", async () => {
  testRejectValue(() => null)
})

test("interpretThyString() should reject undefined variable", async () => {
  const context = makeSimpleContext()
  assert.throws(
    () => interpretString(context, "check ..a.."),
    (e) => {
      assert(e instanceof Error)
      assert.match(e.message, /a not found/)
      assert(e instanceof InterpreterErrorWithContext)
      assert.deepStrictEqual(e.sourceLocation, { line: 0, column: 9 })
      return true
    },
  )
})

test("interpretThyString() should interpolate values from closure", async () => {
  const context = makeSimpleContext({
    closure: { a: "1" },
  })
  assert.strictEqual(interpretString(context, "check ..a.."), "check 1")
})

test("interpretThyString() should interpolate values from implicit arguments", async () => {
  const context = makeSimpleContext({
    implicitArguments: { a: "1" },
  })
  assert.strictEqual(interpretString(context, "check ..a.."), "check 1")
})
