import assert from "node:assert"
import { test } from "under-the-sun"
import { interpretThyCall } from "./call"
import { InterpreterErrorWithContext } from "./interpreter-error"
import { makeSimpleContext } from "./test-helper"
import type { ThyBlockContext } from "./types"

function interpretThyCallBasic(context: ThyBlockContext, parts: readonly string[]) {
  return interpretThyCall(context, parts.map(p => ({text: p, lineIndex: 0, columnIndex: 0})))
}

test("interpretThyCall() should call a function", async () => {
  let called = false
  const context = makeSimpleContext({
    variablesInBlock: { f: () => called = true },
  })
  interpretThyCallBasic(context, [`f`])
  assert(called, "Function should have been called")
})

test("interpretThyCall() should call a function with arguments", async () => {
  let calledArgs: unknown = null
  const context = makeSimpleContext({
    variablesInBlock: { x: true, f: (...args: unknown[]) => calledArgs = args },
  })
  interpretThyCallBasic(context, [`f`, `x`, `"himom"`, `5`])
  assert.deepStrictEqual(calledArgs, [true, "himom", 5], "Function should have been called")
})

test("interpretThyCall() should return value from function called", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 3.14 },
  })
  assert.strictEqual(interpretThyCallBasic(context, [`f`]), 3.14)
})

test("interpretThyCall() should barf on attempt to call non-function", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: 5 },
  })
  const fToken = { text: "f", lineIndex: 4, columnIndex: 5 }
  assert.throws(() => interpretThyCall(context, [fToken]), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /f is not a function/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 4, columnIndex: 5 })
    return true
  })
})

test("interpretThyCall() should return context arguments for given", async () => {
  const context = makeSimpleContext({
    argsToUse: ["a", "b"],
  })
  assert.strictEqual(interpretThyCallBasic(context, [`given`]), "a")
  assert.strictEqual(interpretThyCallBasic(context, [`given`]), "b")
})

test("interpretThyCall() should set givenUsed when given called", async () => {
  const context = makeSimpleContext({
    argsToUse: ["a", "b"],
    givenUsed: false,
  })
  interpretThyCallBasic(context, [`given`])
  assert(context.givenUsed, "givenUsed should have been set")
})

test("interpretThyCall() should return default values for given if args array is exhausted", async () => {
  const context = makeSimpleContext({
    argsToUse: [],
  })
  assert.strictEqual(interpretThyCallBasic(context, [`given`, `"a"`]), "a")
  assert.strictEqual(interpretThyCallBasic(context, [`given`, `"b"`]), "b")
})

test("interpretThyCall() should barf if there are no args or defaults for given", async () => {
  const context = makeSimpleContext({
    argsToUse: [],
  })
  const givenToken = { text: "given", lineIndex: 4, columnIndex: 5 }
  assert.throws(() => interpretThyCall(context, [givenToken]), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /No argument or default available for given/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 4, columnIndex: 5 })
    return true
  })
})

test("interpretThyCall() should barf if too many arguments given", async () => {
  const context = makeSimpleContext({
    argsToUse: [],
  })
  const givenToken = { text: "given", lineIndex: 4, columnIndex: 5 }
  const aToken = { text: "given", lineIndex: 4, columnIndex: 6 }
  const bToken = { text: "given", lineIndex: 4, columnIndex: 7 }
  assert.throws(() => interpretThyCall(context, [givenToken, aToken, bToken]), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /given may only take one argument/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 4, columnIndex: 7 })
    return true
  })
})

test("interpretThyCall() should barf if given is used after implicit argument", async () => {
  const context = makeSimpleContext({
    argsToUse: [{ a: 1 }],
    implicitArguments: { a: 1 },
    implicitArgumentFirstUsed: "a",
  })
  const givenToken = { text: "given", lineIndex: 4, columnIndex: 5 }
  assert.throws(() => interpretThyCall(context, [givenToken]), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /\`given\` cannot be used after implicit arguments are used/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 4, columnIndex: 5 })
    return true
  })
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
  assert.strictEqual(interpretThyCallBasic(context, [`o.f`]), 5)
})
