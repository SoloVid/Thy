import assert from "node:assert"
import { test } from "under-the-sun"
import { interpretThyStatement } from "./statement"
import { makeSimpleContext } from "./test-helper"

test("interpretThyStatement() should call function", async () => {
  let called = false
  const context = makeSimpleContext({
    variablesInBlock: { f: () => called = true },
  })
  interpretThyStatement(context, [`f`])
  assert(called, "Function should have been called")
})

test("interpretThyStatement() should call function with arguments", async () => {
  let calledWith: unknown = null
  const context = makeSimpleContext({
    variablesInBlock: { f: (a: unknown) => calledWith = a },
  })
  interpretThyStatement(context, [`f`, `67`])
  assert.strictEqual(calledWith, 67, "Function should have been called")
})

test("interpretThyStatement() should save result of function call in an immutable variable", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: (a: number) => a + 1 },
  })
  interpretThyStatement(context, [`a`, `is`, `f`, `67`])
  assert.strictEqual(context.variablesInBlock["a"], 68)
})

test("interpretThyStatement() should save result of function call in a mutable variable", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: (a: number) => a + 1 },
  })
  interpretThyStatement(context, [`a`, `be`, `f`, `67`])
  assert.strictEqual(context.variablesInBlock["a"], 68)
})

test("interpretThyStatement() should overwrite mutable variable with result of function call", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: (a: number) => a + 1, a: 50 },
  })
  interpretThyStatement(context, [`a`, `to`, `f`, `a`])
  assert.strictEqual(context.variablesInBlock["a"], 51)
})

test("interpretThyStatement() should reject second attempt to write immutable variable", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
  })
  interpretThyStatement(context, [`a`, `is`, `f`])
  assert.throws(() => interpretThyStatement(context, [`a`, `is`, `f`]), /a is immutable/)
  assert.throws(() => interpretThyStatement(context, [`a`, `be`, `f`]), /a is immutable/)
  assert.throws(() => interpretThyStatement(context, [`a`, `to`, `f`]), /a is immutable/)
})

test("interpretThyStatement() should reject second attempt to redefine mutable variable", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
  })
  interpretThyStatement(context, [`a`, `be`, `f`])
  assert.throws(() => interpretThyStatement(context, [`a`, `be`, `f`]), /a is already defined/)
  assert.throws(() => interpretThyStatement(context, [`a`, `is`, `f`]), /a is already defined/)
})

test("interpretThyStatement() should reject attempt to shadow variable from closure", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
    closure: { a: 1 },
  })
  assert.throws(() => interpretThyStatement(context, [`a`, `be`, `f`]), /a cannot be shadowed/)
})

test("interpretThyStatement() should allow overwriting mutable variable in closure", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
    closure: { a: 1 },
  })
  interpretThyStatement(context, [`a`, `to`, `f`])
  assert.strictEqual(context.closure.a, 5)
})

test("interpretThyStatement() should not allow overwriting immutable variable in closure", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
    closure: { a: 1 },
    closureVariableIsImmutable: { a: true },
  })
  assert.throws(() => interpretThyStatement(context, [`a`, `to`, `f`]), /a is immutable/)
})

test("interpretThyStatement() should not allow overwriting implicit argument", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
    implicitArguments: { a: 1 },
  })
  assert.throws(() => interpretThyStatement(context, [`a`, `to`, `f`]), /implicit argument/)
})

test("interpretThyStatement() should reject invalid variable identifier", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
  })
  assert.throws(() => interpretThyStatement(context, [`$a`, `is`, `f`]), /\$a is not a valid identifier/)
})
