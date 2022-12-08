import assert from "node:assert"
import { test } from "under-the-sun"
import { interpretThyCall } from "./call"
import { makeSimpleContext } from "./test-helper"

test("interpretThyCall() should call a function", async () => {
  let called = false
  const context = makeSimpleContext({
    variablesInBlock: { f: () => called = true },
  })
  interpretThyCall(context, [`f`])
  assert(called, "Function should have been called")
})

test("interpretThyCall() should call a function with arguments", async () => {
  let calledArgs: unknown = null
  const context = makeSimpleContext({
    variablesInBlock: { x: true, f: (...args: unknown[]) => calledArgs = args },
  })
  interpretThyCall(context, [`f`, `x`, `"himom"`, `5`])
  assert.deepStrictEqual(calledArgs, [true, "himom", 5], "Function should have been called")
})

test("interpretThyCall() should return value from function called", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 3.14 },
  })
  assert.strictEqual(interpretThyCall(context, [`f`]), 3.14)
})

test("interpretThyCall() should barf on attempt to call non-function", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: 5 },
  })
  assert.throws(() => interpretThyCall(context, [`f`]), /f is not a function/)
})

test("interpretThyCall() should return context arguments for given", async () => {
  const context = makeSimpleContext({
    argsToUse: ["a", "b"],
  })
  assert.strictEqual(interpretThyCall(context, [`given`]), "a")
  assert.strictEqual(interpretThyCall(context, [`given`]), "b")
})

test("interpretThyCall() should return default values for given if args array is exhausted", async () => {
  const context = makeSimpleContext({
    argsToUse: [],
  })
  assert.strictEqual(interpretThyCall(context, [`given`, `"a"`]), "a")
  assert.strictEqual(interpretThyCall(context, [`given`, `"b"`]), "b")
})

test("interpretThyCall() should barf if there are no args or defaults for given", async () => {
  const context = makeSimpleContext({
    argsToUse: [],
  })
  assert.throws(() => interpretThyCall(context, [`given`]), /No argument or default available for given/)
})
