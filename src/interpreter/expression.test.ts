import type { CompileError } from "compile-error"
import { expect } from "expect"
import assert from "node:assert"
import { parseBlockInner } from "parser/parse-block"
import { makeParserState } from "parser/parser-state"
import { test } from "test-framework"
import { makeTokenizer } from "tokenizer"
import { isCall } from "tree/call"
import { interpretThyExpression } from "./expression"
import { InterpreterErrorWithContext } from "./interpreter-error"
import { makeSimpleContext } from "./test-helper"
import type { ThyBlockContext } from "./types"

const testLocation = {
  line: 1,
  column: 4,
}

function interpretThyExpressionBasic(context: ThyBlockContext, source: string) {
  const errors: CompileError[] = []
  const tokenizer = makeTokenizer(`Comment\ndef ${source}`, errors)
  const parserState = makeParserState(tokenizer, errors)
  const block = parseBlockInner(parserState)
  expect(errors).toEqual([])
  assert(block.ideas.length === 2, "parsed block should have 2 ideas")
  const call = block.ideas[1]
  assert(isCall(call), "parsed idea should be a call")
  assert(call.args.length === 1, "parsed call should have 1 argument")
  const maybeAsync = interpretThyExpression(context, call.args[0])
  assert(!maybeAsync.wait, "This test case shouldn't be handling async")
  return maybeAsync.value
}

test("interpretThyExpression() can return number", async () => {
  const context = makeSimpleContext()
  assert.strictEqual(interpretThyExpressionBasic(context, "5.5").target, 5.5)
})

test("interpretThyExpression() can return string", async () => {
  const context = makeSimpleContext()
  assert.strictEqual(
    interpretThyExpressionBasic(context, `"himom"`).target,
    "himom",
  )
})

test("interpretThyExpression() can return string with numbers", async () => {
  const context = makeSimpleContext()
  assert.strictEqual(interpretThyExpressionBasic(context, `"1"`).target, "1")
})

test("interpretThyExpression() can return multiline string", async () => {
  const context = makeSimpleContext()
  assert.strictEqual(
    interpretThyExpressionBasic(context, `"one\\ntwo"`).target,
    "one\ntwo",
  )
})

test("interpretThyExpression() respects escape codes in string", async () => {
  const context = makeSimpleContext()
  assert.strictEqual(
    interpretThyExpressionBasic(context, `"hi mom\\n\\"how'r u\\""`).target,
    'hi mom\n"how\'r u"',
  )
})

test("interpretThyExpression() can interpolate string", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { a: 12 },
  })
  assert.strictEqual(
    interpretThyExpressionBasic(context, `"check .a."`).target,
    "check 12",
  )
})

test("interpretThyExpression() allows escaping periods in string", async () => {
  const context = makeSimpleContext()
  assert.strictEqual(
    interpretThyExpressionBasic(context, `"check \\.a\\."`).target,
    "check .a.",
  )
})

test("interpretThyExpression() can pull value from local variables", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { x: 5 },
  })
  assert.strictEqual(interpretThyExpressionBasic(context, `x`).target, 5)
})

test("interpretThyExpression() can pull value from implicit arguments", async () => {
  const context = makeSimpleContext({
    implicitArguments: { x: 5 },
  })
  assert.strictEqual(interpretThyExpressionBasic(context, `x`).target, 5)
})

test("interpretThyExpression() can pull value from closure", async () => {
  const context = makeSimpleContext({
    closure: { x: 5 },
  })
  assert.strictEqual(interpretThyExpressionBasic(context, `x`).target, 5)
})

test("interpretThyExpression() should set implicitArgumentFirstUsed when an implicit argument is used", async () => {
  const context = makeSimpleContext({
    implicitArguments: { x: 5 },
    implicitArgumentFirstUsed: null,
  })
  interpretThyExpressionBasic(context, `x`)
  assert.strictEqual(context.implicitArgumentFirstUsed, "x")
})

test("interpretThyExpression() should not overwrite implicitArgumentFirstUsed", async () => {
  const context = makeSimpleContext({
    implicitArguments: { x: 5, y: 6 },
    implicitArgumentFirstUsed: null,
  })
  interpretThyExpressionBasic(context, `x`)
  interpretThyExpressionBasic(context, `y`)
  assert.strictEqual(context.implicitArgumentFirstUsed, "x")
})

test("interpretThyExpression() barfs if implicit argument used after given", async () => {
  const context = makeSimpleContext({
    givenUsed: true,
    implicitArguments: { x: 5 },
  })
  assert.throws(
    () => interpretThyExpressionBasic(context, `x`),
    (e) => {
      assert(e instanceof Error)
      assert.match(
        e.message,
        /Implicit arguments cannot be used \(referenced x\) after `given`/,
      )
      assert(e instanceof InterpreterErrorWithContext)
      assert.deepStrictEqual(e.sourceLocation, testLocation)
      return true
    },
  )
})

test("interpretThyExpression() returns variable of same name as implicit argument if implicit arguments not used", async () => {
  const context = makeSimpleContext({
    givenUsed: true,
    implicitArguments: { x: 5 },
    variablesInBlock: { x: 6 },
  })
  assert.strictEqual(interpretThyExpressionBasic(context, `x`).target, 6)
})

test("interpretThyExpression() can do member access", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { x: { y: { z: 6 } } },
  })
  assert.deepStrictEqual(interpretThyExpressionBasic(context, `x.y.z`), {
    target: 6,
    thisValue: { z: 6 },
  })
})

test("interpretThyExpression() barfs if variable is not found", async () => {
  const context = makeSimpleContext()
  assert.throws(() => interpretThyExpressionBasic(context, `x`), /x not found/)
})

test("interpretThyExpression() barfs if member access is attempted on undefined value", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { x: { y: undefined } },
  })
  assert.throws(
    () => interpretThyExpressionBasic(context, `x.y.z`),
    (e) => {
      assert(e instanceof Error)
      assert.match(e.message, /y has no value/)
      assert(e instanceof InterpreterErrorWithContext)
      assert.deepStrictEqual(e.sourceLocation, testLocation)
      return true
    },
  )
})

test("interpretThyExpression() interprets array as block", async () => {
  const context = makeSimpleContext()
  const f = interpretThyExpressionBasic(context, "\n  return 5")
    .target as unknown
  assert(typeof f === "function", "Expression should be a function")
  assert.strictEqual(f(), 5)
})

test("interpretThyExpression() allows block to access variables from this scope's closure", async () => {
  const context = makeSimpleContext({
    closure: { x: 5 },
  })
  const f = interpretThyExpressionBasic(context, "\n  return x")
    .target as unknown
  assert(typeof f === "function", "Expression should be a function")
  assert.strictEqual(f(), 5)
})

test("interpretThyExpression() allows block to access variables from this scope's implicit arguments", async () => {
  const context = makeSimpleContext({
    implicitArguments: { x: 5 },
  })
  const f = interpretThyExpressionBasic(context, "\n  return x")
    .target as unknown
  assert(typeof f === "function", "Expression should be a function")
  assert.strictEqual(f(), 5)
})

test("interpretThyExpression() allows block to access variables from this scope's local block variables", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { x: 5 },
  })
  const f = interpretThyExpressionBasic(context, "\n  return x")
    .target as unknown
  assert(typeof f === "function", "Expression should be a function")
  assert.strictEqual(f(), 5)
})
