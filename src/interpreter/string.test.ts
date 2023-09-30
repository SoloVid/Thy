import assert from "node:assert"
import { test } from "under-the-sun"
import { interpolateString, interpretThyMultilineString, parseString } from "./string"
import { makeSimpleContext } from "./test-helper"

test("interpretThyMultilineString() should return string with stripped insignificant whitespace", async () => {
  const input = {
    indent: "    ",
    lines: [
      "",
      "  ",
      "    ",
      "     ",
      "    something",
      "",
      "     ",
      "    ",
      "",
    ]
  }
  const output = interpretThyMultilineString(input)
  assert.strictEqual(output, `"\\n\\n\\n \\nsomething\\n\\n "`)
})

test("interpretThyMultilineString() should escape quotes", async () => {
  const input = {
    indent: "    ",
    lines: [
      `say "hi"!`
    ]
  }
  const output = interpretThyMultilineString(input)
  assert.strictEqual(output, `"say \\"hi\\"!"`)
})

test("interpolateString() should interpolate string values", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { a: "1", b: "2" },
  })
  assert.strictEqual(interpolateString(context, "check .a. .b. and .b..a."), "check 1 2 and 21")
})

test("interpolateString() should interpolate number values", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { a: 1, b: 2.3 },
  })
  assert.strictEqual(interpolateString(context, "check .a. .b. and .b..a."), "check 1 2.3 and 2.31")
})

function testRejectValue(value: unknown) {
  const context = makeSimpleContext({
    variablesInBlock: { a: value },
  })
  assert.throws(() => interpolateString(context, "check .a."), /a is not a string or number/)
}

test("interpolateString() should reject boolean value for interpolation", async () => {
  testRejectValue(true)
})

test("interpolateString() should reject null value for interpolation", async () => {
  testRejectValue(null)
})

test("interpolateString() should reject undefined value for interpolation", async () => {
  testRejectValue(undefined)
})

test("interpolateString() should reject object value for interpolation", async () => {
  testRejectValue({})
})

test("interpolateString() should reject array value for interpolation", async () => {
  testRejectValue([])
})

test("interpolateString() should reject function value for interpolation", async () => {
  testRejectValue(() => null)
})

test("interpolateString() should reject undefined variable", async () => {
  const context = makeSimpleContext()
  assert.throws(() => interpolateString(context, "check .a."), /a not found/)
})

test("interpolateString() should interpolate values from closure", async () => {
  const context = makeSimpleContext({
    closure: { a: "1" },
  })
  assert.strictEqual(interpolateString(context, "check .a."), "check 1")
})

test("interpolateString() should interpolate values from implicit arguments", async () => {
  const context = makeSimpleContext({
    implicitArguments: { a: "1" },
  })
  assert.strictEqual(interpolateString(context, "check .a."), "check 1")
})

test("interpolateString() should not mess with normal periods", async () => {
  const context = makeSimpleContext()
  assert.strictEqual(interpolateString(context, "There once. Was a thing."), "There once. Was a thing.")
})

test("interpolateString() should allow escaping periods", async () => {
  const context = makeSimpleContext()
  assert.strictEqual(interpolateString(context, "check \\.a\\."), "check .a.")
})

test("parseString() should behave similar to JSON.parse()", async () => {
  assert.strictEqual(parseString(`"a\\"\\n"`), `a"\n`)
})

test("parseString() should reject bad string literal", async () => {
  assert.throws(() => parseString(`"unterminated`), /Invalid string literal/)
})

test("parseString() should leave period escape", async () => {
  assert.strictEqual(parseString(`". \\. \\\\\\."`), `. \\. \\\\.`)
})
