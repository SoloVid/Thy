import type { CompileError } from "common/compile-error.ts"
import { expect } from "expect"
import assert from "node:assert"
import { parseBlockInner } from "parser/parse-block.ts"
import { makeParserState } from "parser/parser-state.ts"
import { test } from "test-framework"
import { makeTokenizer } from "tokenizer"
import { isCall } from "tree"
import { interpretThyCall } from "./call.ts"
import { InterpreterErrorWithContext } from "./interpreter-error.ts"
import { makeSimpleContext } from "./test-helper.ts"
import type { ThyBlockContext } from "./types.ts"

function interpretThyCallBasic(context: ThyBlockContext, source: string) {
  const errors: CompileError[] = []
  const tokenizer = makeTokenizer(source, errors)
  const parserState = makeParserState(tokenizer, errors)
  const block = parseBlockInner(parserState)
  expect(errors).toEqual([])
  assert(block.ideas.length === 1, "parsed block should have 1 idea")
  const call = block.ideas[0]
  assert(isCall(call), "parsed idea should be a call")
  const raw = interpretThyCall(context, call)
  assert(!raw.wait, "This test should not be processing async stuff")
  return raw.value
}

test("interpretThyCall() should call a function", async () => {
  let called = false
  const context = makeSimpleContext({
    variablesInBlock: { f: () => (called = true) },
  })
  interpretThyCallBasic(context, `f`)
  assert(called, "Function should have been called")
})

test("interpretThyCall() should call a function with arguments", async () => {
  let calledArgs: unknown = null
  const context = makeSimpleContext({
    variablesInBlock: {
      x: true,
      f: (...args: unknown[]) => (calledArgs = args),
    },
  })
  interpretThyCallBasic(context, `f x "himom" 5`)
  assert.deepStrictEqual(
    calledArgs,
    [true, "himom", 5],
    "Function should have been called",
  )
})

test("interpretThyCall() should return value from function called", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 3.14 },
  })
  assert.strictEqual(interpretThyCallBasic(context, `f`), 3.14)
})

test("interpretThyCall() should barf on attempt to call non-function", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: 5 },
  })
  assert.throws(
    () => interpretThyCallBasic(context, `f`),
    (e) => {
      assert(e instanceof Error)
      assert.match(e.message, /f is not a function/)
      assert(e instanceof InterpreterErrorWithContext)
      assert.deepStrictEqual(e.sourceLocation, { line: 0, column: 0 })
      return true
    },
  )
})

test("interpretThyCall() should return context arguments for given", async () => {
  const context = makeSimpleContext({
    argsToUse: ["a", "b"],
  })
  assert.strictEqual(interpretThyCallBasic(context, `given`), "a")
  assert.strictEqual(interpretThyCallBasic(context, `given`), "b")
})

test("interpretThyCall() should set givenUsed when given called", async () => {
  const context = makeSimpleContext({
    argsToUse: ["a", "b"],
    givenUsed: false,
  })
  interpretThyCallBasic(context, `given`)
  assert(context.givenUsed, "givenUsed should have been set")
})

test("interpretThyCall() should return default values for given if args array is exhausted", async () => {
  const context = makeSimpleContext({
    argsToUse: [],
  })
  assert.strictEqual(interpretThyCallBasic(context, `given "a"`), "a")
  assert.strictEqual(interpretThyCallBasic(context, `given "b"`), "b")
})

test("interpretThyCall() should barf if there are no args or defaults for given", async () => {
  const context = makeSimpleContext({
    argsToUse: [],
  })
  assert.throws(
    () => interpretThyCallBasic(context, `given`),
    (e) => {
      assert(e instanceof Error)
      assert.match(e.message, /No argument or default available for given/)
      assert(e instanceof InterpreterErrorWithContext)
      assert.deepStrictEqual(e.sourceLocation, { line: 0, column: 0 })
      return true
    },
  )
})

test("interpretThyCall() should barf if given is used after implicit argument", async () => {
  const context = makeSimpleContext({
    argsToUse: [{ a: 1 }],
    implicitArguments: { a: 1 },
    implicitArgumentFirstUsed: "a",
  })
  assert.throws(
    () => interpretThyCallBasic(context, `given`),
    (e) => {
      assert(e instanceof Error)
      assert.match(
        e.message,
        /\`given\` cannot be used after implicit arguments are used/,
      )
      assert(e instanceof InterpreterErrorWithContext)
      assert.deepStrictEqual(e.sourceLocation, { line: 0, column: 0 })
      return true
    },
  )
})

test("interpretThyCall() should properly pass `this` in function call", async () => {
  class C {
    a = 5
    f() {
      return this.a
    }
  }

  const context = makeSimpleContext({
    variablesInBlock: { o: new C() },
  })
  assert.strictEqual(interpretThyCallBasic(context, `o.f`), 5)
})
