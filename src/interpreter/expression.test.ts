import assert from "node:assert"
import { test } from "under-the-sun"
import { interpretThyExpression } from "./expression"
import { makeSimpleContext } from "./test-helper"
import type { ThyBlockContext } from "./types"

test("interpretThyExpression() can return number", async () => {
  const context = makeSimpleContext()
  assert.strictEqual(interpretThyExpression(context, "5.5"), 5.5)
})

test("interpretThyExpression() can return string", async () => {
  const context = makeSimpleContext()
  assert.strictEqual(interpretThyExpression(context, `"himom"`), "himom")
})

test("interpretThyExpression() can return string with numbers", async () => {
  const context = makeSimpleContext()
  assert.strictEqual(interpretThyExpression(context, `"1"`), "1")
})

test("interpretThyExpression() can return multiline string", async () => {
  const context = makeSimpleContext()
  assert.strictEqual(interpretThyExpression(context, `"one\\ntwo"`), "one\ntwo")
})

test("interpretThyExpression() respects escape codes in string", async () => {
  const context = makeSimpleContext()
  assert.strictEqual(interpretThyExpression(context, `"hi mom\\n\\"how'r u\\""`), "hi mom\n\"how'r u\"")
})

test("interpretThyExpression() can interpolate string", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { a: 12 },
  })
  assert.strictEqual(interpretThyExpression(context, `"check .a."`), "check 12")
})

test("interpretThyExpression() allows escaping periods in string", async () => {
  const context = makeSimpleContext()
  assert.strictEqual(interpretThyExpression(context, `"check \\.a\\."`), "check .a.")
})

test("interpretThyExpression() can pull value from local variables", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { x: 5 }
  })
  assert.strictEqual(interpretThyExpression(context, `x`), 5)
})

test("interpretThyExpression() can pull value from implicit arguments", async () => {
  const context = makeSimpleContext({
    implicitArguments: { x: 5 }
  })
  assert.strictEqual(interpretThyExpression(context, `x`), 5)
})

test("interpretThyExpression() can pull value from closure", async () => {
  const context = makeSimpleContext({
    closure: { x: 5 }
  })
  assert.strictEqual(interpretThyExpression(context, `x`), 5)
})

test("interpretThyExpression() should set implicitArgumentFirstUsed when an implicit argument is used", async () => {
  const context = makeSimpleContext({
    implicitArguments: { x: 5 },
    implicitArgumentFirstUsed: null,
  })
  interpretThyExpression(context, `x`)
  assert.strictEqual(context.implicitArgumentFirstUsed, "x")
})

test("interpretThyExpression() should not overwrite implicitArgumentFirstUsed", async () => {
  const context = makeSimpleContext({
    implicitArguments: { x: 5, y: 6 },
    implicitArgumentFirstUsed: null,
  })
  interpretThyExpression(context, `x`)
  interpretThyExpression(context, `y`)
  assert.strictEqual(context.implicitArgumentFirstUsed, "x")
})

test("interpretThyExpression() barfs if implicit argument used after given", async () => {
  const context = makeSimpleContext({
    givenUsed: true,
    implicitArguments: { x: 5 }
  })
  assert.throws(() => interpretThyExpression(context, `x`), /Implicit arguments cannot be used \(referenced x\) after `given`/)
})

test("interpretThyExpression() can do member access", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { x: { y: { z: 6 } } }
  })
  assert.strictEqual(interpretThyExpression(context, `x.y.z`), 6)
})

test("interpretThyExpression() barfs if variable is not found", async () => {
  const context = makeSimpleContext()
  assert.throws(() => interpretThyExpression(context, `x`), /x not found/)
})

test("interpretThyExpression() barfs if identifier is invalid", async () => {
  const context = makeSimpleContext()
  assert.throws(() => interpretThyExpression(context, `$x`), /Invalid identifier: \$x/)
})

test("interpretThyExpression() barfs if member access is invalid", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { x: { $y: { z: 6 } } }
  })
  assert.throws(() => interpretThyExpression(context, `x.$y.z`), /Invalid \(member\) identifier: \$y/)
})

test("interpretThyExpression() barfs if member access is attempted on falsey value", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { x: { y: null } }
  })
  assert.throws(() => interpretThyExpression(context, `x.y.z`), /y has no value/)
})

test("interpretThyExpression() interprets array as block", async () => {
  const context = makeSimpleContext()
  const f = interpretThyExpression(context, ["return 5"])
  assert(typeof f === "function", "Expression should be a function")
  assert.strictEqual(f(), 5)
})

test("interpretThyExpression() allows block to access variables from this scope's closure", async () => {
  const context = makeSimpleContext({
    closure: { x: 5 },
  })
  const f = interpretThyExpression(context, ["return x"])
  assert(typeof f === "function", "Expression should be a function")
  assert.strictEqual(f(), 5)
})

test("interpretThyExpression() allows block to write mutable variables from this scope's closure", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 6 },
    closure: { x: 5 },
  })
  const f = interpretThyExpression(context, ["x to f"])
  assert(typeof f === "function", "Expression should be a function")
  f()
  assert.strictEqual(context.closure.x, 6)
})

test("interpretThyExpression() barfs if block attempts to write immutable variables from this scope's closure", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 6 },
    closure: { x: 5 },
    closureVariableIsImmutable: { x: true },
  })
  const f = interpretThyExpression(context, ["x to f"])
  assert(typeof f === "function", "Expression should be a function")
  assert.throws(() => f(), /x is immutable/)
})

test("interpretThyExpression() allows block to access variables from this scope's implicit arguments", async () => {
  const context = makeSimpleContext({
    implicitArguments: { x: 5 },
  })
  const f = interpretThyExpression(context, ["return x"])
  assert(typeof f === "function", "Expression should be a function")
  assert.strictEqual(f(), 5)
})

test("interpretThyExpression() barfs if block attempts to overwrite this scope's implicit arguments", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 6 },
    implicitArguments: { x: 5 },
  })
  const f = interpretThyExpression(context, ["x to f"])
  assert(typeof f === "function", "Expression should be a function")
  // TODO: Should this be made a more explicit error about implicit arguments? Would require tracking more context I think.
  assert.throws(() => f(), /x is immutable/)
})

test("interpretThyExpression() allows block to access variables from this scope's local block variables", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { x: 5 },
  })
  const f = interpretThyExpression(context, ["return x"])
  assert(typeof f === "function", "Expression should be a function")
  assert.strictEqual(f(), 5)
})

test("interpretThyExpression() allows block to write mutable variables from this scope's local block variables", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 6, x: 5 },
  })
  const f = interpretThyExpression(context, ["x to f"])
  assert(typeof f === "function", "Expression should be a function")
  f()
  assert.strictEqual(context.variablesInBlock.x, 6)
})

test("interpretThyExpression() barfs if block attempts to write immutable variables from this scope's local block variables", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 6, x: 5 },
    variableIsImmutable: { x: true },
  })
  const f = interpretThyExpression(context, ["x to f"])
  assert(typeof f === "function", "Expression should be a function")
  assert.throws(() => f(), /x is immutable/)
})

test("interpretThyExpression() replaces `that` with stored value from context", async () => {
  const context = makeSimpleContext({
    thatValue: 5,
  })
  assert.strictEqual(interpretThyExpression(context, "that"), 5)
  // Do it again to verify it wasn't removed.
  assert.strictEqual(interpretThyExpression(context, "that"), 5)
  // Triple-check it wasn't removed.
  assert.strictEqual(context.thatValue, 5)
})

test("interpretThyExpression() barfs on `that` if value is unavailable from context", async () => {
  const context = makeSimpleContext({
    thatValue: undefined,
  })
  assert.throws(() => interpretThyExpression(context, "that"), /Value is not available for `that`/)
})

test("interpretThyExpression() replaces `beforeThat` with stored value from context", async () => {
  const context = makeSimpleContext({
    beforeThatValue: 5,
  })
  assert.strictEqual(interpretThyExpression(context, "beforeThat"), 5)
  // Do it again to verify it wasn't removed.
  assert.strictEqual(interpretThyExpression(context, "beforeThat"), 5)
  // Triple-check it wasn't removed.
  assert.strictEqual(context.beforeThatValue, 5)
})

test("interpretThyExpression() barfs on `beforeThat` if value is unavailable from context", async () => {
  const context = makeSimpleContext({
    beforeThatValue: undefined,
  })
  assert.throws(() => interpretThyExpression(context, "beforeThat"), /Value is not available for `beforeThat`/)
})
