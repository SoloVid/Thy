import assert from "node:assert"
import { test } from "under-the-sun"
import { interpretThyExpression } from "./expression"
import { InterpreterErrorWithContext } from "./interpreter-error"
import { makeSimpleContext } from "./test-helper"
import type { ThyBlockContext } from "./types"

function interpretThyExpressionBasic(context: ThyBlockContext, expression: string | readonly string[]) {
  if (Array.isArray(expression)) {
    return interpretThyExpression(context, { lines: expression, lineIndex: -1 })
  }
  return interpretThyExpression(context, { text: expression as string, lineIndex: -1, columnIndex: -1 })
}

test("interpretThyExpression() can return number", async () => {
  const context = makeSimpleContext()
  assert.strictEqual(interpretThyExpressionBasic(context, "5.5").target, 5.5)
})

test("interpretThyExpression() can return string", async () => {
  const context = makeSimpleContext()
  assert.strictEqual(interpretThyExpressionBasic(context, `"himom"`).target, "himom")
})

test("interpretThyExpression() can return string with numbers", async () => {
  const context = makeSimpleContext()
  assert.strictEqual(interpretThyExpressionBasic(context, `"1"`).target, "1")
})

test("interpretThyExpression() can return multiline string", async () => {
  const context = makeSimpleContext()
  assert.strictEqual(interpretThyExpressionBasic(context, `"one\\ntwo"`).target, "one\ntwo")
})

test("interpretThyExpression() respects escape codes in string", async () => {
  const context = makeSimpleContext()
  assert.strictEqual(interpretThyExpressionBasic(context, `"hi mom\\n\\"how'r u\\""`).target, "hi mom\n\"how'r u\"")
})

test("interpretThyExpression() can interpolate string", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { a: 12 },
  })
  assert.strictEqual(interpretThyExpressionBasic(context, `"check .a."`).target, "check 12")
})

test("interpretThyExpression() allows escaping periods in string", async () => {
  const context = makeSimpleContext()
  assert.strictEqual(interpretThyExpressionBasic(context, `"check \\.a\\."`).target, "check .a.")
})

test("interpretThyExpression() can pull value from local variables", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { x: 5 }
  })
  assert.strictEqual(interpretThyExpressionBasic(context, `x`).target, 5)
})

test("interpretThyExpression() can pull value from implicit arguments", async () => {
  const context = makeSimpleContext({
    implicitArguments: { x: 5 }
  })
  assert.strictEqual(interpretThyExpressionBasic(context, `x`).target, 5)
})

test("interpretThyExpression() can pull value from closure", async () => {
  const context = makeSimpleContext({
    closure: { x: 5 }
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
    implicitArguments: { x: 5 }
  })
  const token = { text: "x", lineIndex: 1, columnIndex: 2 }
  assert.throws(() => interpretThyExpression(context, token), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /Implicit arguments cannot be used \(referenced x\) after `given`/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 1, columnIndex: 2 })
    return true
  })
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
    variablesInBlock: { x: { y: { z: 6 } } }
  })
  assert.deepStrictEqual(interpretThyExpressionBasic(context, `x.y.z`), { target: 6, thisValue: { z: 6 } })
})

test("interpretThyExpression() barfs if variable is not found", async () => {
  const context = makeSimpleContext()
  assert.throws(() => interpretThyExpressionBasic(context, `x`), /x not found/)
})

test("interpretThyExpression() barfs if identifier is invalid", async () => {
  const context = makeSimpleContext()
  const identifierToken = { text: "$x", lineIndex: 1, columnIndex: 2 }
  assert.throws(() => interpretThyExpression(context, identifierToken), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /Invalid identifier: \$x/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 1, columnIndex: 2 })
    return true
  })
})

test("interpretThyExpression() barfs if member access is invalid", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { x: { $y: { z: 6 } } }
  })
  const token = { text: `x.$y.z`, lineIndex: 1, columnIndex: 2 }
  assert.throws(() => interpretThyExpression(context, token), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /Invalid \(member\) identifier: \$y/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 1, columnIndex: 2 })
    return true
  })
})

test("interpretThyExpression() barfs if member access is attempted on falsey value", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { x: { y: null } }
  })
  const token = { text: `x.y.z`, lineIndex: 1, columnIndex: 2 }
  assert.throws(() => interpretThyExpression(context, token), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /y has no value/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 1, columnIndex: 2 })
    return true
  })
})

test("interpretThyExpression() interprets array as block", async () => {
  const context = makeSimpleContext()
  const f = interpretThyExpressionBasic(context, ["return 5"]).target
  assert(typeof f === "function", "Expression should be a function")
  assert.strictEqual(f(), 5)
})

test("interpretThyExpression() allows block to access variables from this scope's closure", async () => {
  const context = makeSimpleContext({
    closure: { x: 5 },
  })
  const f = interpretThyExpressionBasic(context, ["return x"]).target
  assert(typeof f === "function", "Expression should be a function")
  assert.strictEqual(f(), 5)
})

test("interpretThyExpression() allows block to write mutable variables from this scope's closure", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 6 },
    closure: { x: 5 },
  })
  const f = interpretThyExpressionBasic(context, ["x to f"]).target
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
  const f = interpretThyExpressionBasic(context, ["x to f"]).target
  assert(typeof f === "function", "Expression should be a function")
  assert.throws(() => f(), /x is immutable/)
})

test("interpretThyExpression() allows block to access variables from this scope's implicit arguments", async () => {
  const context = makeSimpleContext({
    implicitArguments: { x: 5 },
  })
  const f = interpretThyExpressionBasic(context, ["return x"]).target
  assert(typeof f === "function", "Expression should be a function")
  assert.strictEqual(f(), 5)
})

test("interpretThyExpression() barfs if block attempts to overwrite this scope's implicit arguments", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 6 },
    implicitArguments: { x: 5 },
  })
  const f = interpretThyExpressionBasic(context, ["x to f"]).target
  assert(typeof f === "function", "Expression should be a function")
  // TODO: Should this be made a more explicit error about implicit arguments? Would require tracking more context I think.
  assert.throws(() => f(), /x is immutable/)
})

test("interpretThyExpression() allows block to access variables from this scope's local block variables", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { x: 5 },
  })
  const f = interpretThyExpressionBasic(context, ["return x"]).target
  assert(typeof f === "function", "Expression should be a function")
  assert.strictEqual(f(), 5)
})

test("interpretThyExpression() allows block to write mutable variables from this scope's local block variables", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 6, x: 5 },
  })
  const f = interpretThyExpressionBasic(context, ["x to f"]).target
  assert(typeof f === "function", "Expression should be a function")
  f()
  assert.strictEqual(context.variablesInBlock.x, 6)
})

test("interpretThyExpression() barfs if block attempts to write immutable variables from this scope's local block variables", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 6, x: 5 },
    variableIsImmutable: { x: true },
  })
  const f = interpretThyExpressionBasic(context, ["x to f"]).target
  assert(typeof f === "function", "Expression should be a function")
  assert.throws(() => f(), /x is immutable/)
})

test("interpretThyExpression() replaces `that` with stored value from context", async () => {
  const context = makeSimpleContext({
    thatValue: 5,
  })
  assert.strictEqual(interpretThyExpressionBasic(context, "that").target, 5)
  // Do it again to verify it wasn't removed.
  assert.strictEqual(interpretThyExpressionBasic(context, "that").target, 5)
  // Triple-check it wasn't removed.
  assert.strictEqual(context.thatValue, 5)
})

test("interpretThyExpression() replaces `that` with stored value from context when used as base for property access", async () => {
  const context = makeSimpleContext({
    thatValue: { a: 5 },
  })
  assert.strictEqual(interpretThyExpressionBasic(context, "that.a").target, 5)
})

test("interpretThyExpression() barfs on `that` if value is unavailable from context", async () => {
  const context = makeSimpleContext({
    thatValue: undefined,
  })
  const thatToken = { text: "that", lineIndex: 1, columnIndex: 2 }
  assert.throws(() => interpretThyExpression(context, thatToken), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /Value is not available for `that`/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 1, columnIndex: 2 })
    return true
  })
})

test("interpretThyExpression() replaces `beforeThat` with stored value from context", async () => {
  const context = makeSimpleContext({
    beforeThatValue: 5,
  })
  assert.strictEqual(interpretThyExpressionBasic(context, "beforeThat").target, 5)
  // Do it again to verify it wasn't removed.
  assert.strictEqual(interpretThyExpressionBasic(context, "beforeThat").target, 5)
  // Triple-check it wasn't removed.
  assert.strictEqual(context.beforeThatValue, 5)
})

test("interpretThyExpression() barfs on `beforeThat` if value is unavailable from context", async () => {
  const context = makeSimpleContext({
    beforeThatValue: undefined,
  })
  const beforeThatToken = { text: "beforeThat", lineIndex: 1, columnIndex: 2 }
  assert.throws(() => interpretThyExpression(context, beforeThatToken), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /Value is not available for `beforeThat`/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 1, columnIndex: 2 })
    return true
  })
})
