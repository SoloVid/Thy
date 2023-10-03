import assert from "node:assert"
import { test } from "under-the-sun"
import { InterpreterErrorWithContext } from "./call"
import { interpretThyStatement } from "./statement"
import { makeSimpleContext } from "./test-helper"
import type { AtomSingle, ThyBlockContext } from "./types"

function interpretThyStatementBasic(context: ThyBlockContext, parts: readonly (string | AtomSingle)[]) {
  return interpretThyStatement(context, parts.map(p => typeof p === "string" ? ({ text: p, lineIndex: -1, columnIndex: -1 }) : p))
}

test("interpretThyStatement() should call function", async () => {
  let called = false
  const context = makeSimpleContext({
    variablesInBlock: { f: () => called = true },
  })
  interpretThyStatementBasic(context, [`f`])
  assert(called, "Function should have been called")
})

test("interpretThyStatement() should call function with arguments", async () => {
  let calledWith: unknown = null
  const context = makeSimpleContext({
    variablesInBlock: { f: (a: unknown) => calledWith = a },
  })
  interpretThyStatementBasic(context, [`f`, `67`])
  assert.strictEqual(calledWith, 67, "Function should have been called")
})

test("interpretThyStatement() should save result of function call in an immutable variable", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: (a: number) => a + 1 },
  })
  interpretThyStatementBasic(context, [`a`, `is`, `f`, `67`])
  assert.strictEqual(context.variablesInBlock["a"], 68)
})

test("interpretThyStatement() should save result of function call in a mutable variable", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: (a: number) => a + 1 },
  })
  interpretThyStatementBasic(context, [`a`, `be`, `f`, `67`])
  assert.strictEqual(context.variablesInBlock["a"], 68)
})

test("interpretThyStatement() should overwrite mutable variable with result of function call", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: (a: number) => a + 1, a: 50 },
  })
  interpretThyStatementBasic(context, [`a`, `to`, `f`, `a`])
  assert.strictEqual(context.variablesInBlock["a"], 51)
})

test("interpretThyStatement() should reject second attempt to write immutable variable", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
  })
  const aToken = { text: "a", lineIndex: 2, columnIndex: 4 }
  interpretThyStatementBasic(context, [aToken, `is`, `f`])
  assert.throws(() => interpretThyStatementBasic(context, [aToken, `is`, `f`]), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /a is immutable/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 2, columnIndex: 4 })
    return true
  })
  assert.throws(() => interpretThyStatementBasic(context, [aToken, `be`, `f`]), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /a is immutable/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 2, columnIndex: 4 })
    return true
  })
  assert.throws(() => interpretThyStatementBasic(context, [aToken, `to`, `f`]), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /a is immutable/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 2, columnIndex: 4 })
    return true
  })
})

test("interpretThyStatement() should reject second attempt to redefine mutable variable", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
  })
  const aToken = { text: "a", lineIndex: 2, columnIndex: 4 }
  interpretThyStatementBasic(context, [aToken, `be`, `f`])
  assert.throws(() => interpretThyStatementBasic(context, [aToken, `be`, `f`]), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /a is already defined/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 2, columnIndex: 4 })
    return true
  })
  assert.throws(() => interpretThyStatementBasic(context, [aToken, `is`, `f`]), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /a is already defined/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 2, columnIndex: 4 })
    return true
  })
})

test("interpretThyStatement() should reject attempt to shadow variable from closure", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
    closure: { a: 1 },
  })
  assert.throws(() => interpretThyStatementBasic(context, [{ text: "a", lineIndex: 2, columnIndex: 4 }, `be`, `f`]), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /a cannot be shadowed/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 2, columnIndex: 4 })
    return true
  })
})

test("interpretThyStatement() should allow overwriting mutable variable in closure", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
    closure: { a: 1 },
  })
  interpretThyStatementBasic(context, [`a`, `to`, `f`])
  assert.strictEqual(context.closure.a, 5)
})

test("interpretThyStatement() should not allow overwriting immutable variable in closure", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
    closure: { a: 1 },
    closureVariableIsImmutable: { a: true },
  })
  assert.throws(() => interpretThyStatementBasic(context, [{ text: "a", lineIndex: 2, columnIndex: 4 }, `to`, `f`]), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /a is immutable/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 2, columnIndex: 4 })
    return true
  })
})

test("interpretThyStatement() should not allow overwriting implicit argument", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
    implicitArguments: { a: 1 },
  })
  assert.throws(() => interpretThyStatementBasic(context, [{ text: "a", lineIndex: 2, columnIndex: 4 }, `to`, `f`]), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /implicit argument/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 2, columnIndex: 4 })
    return true
  })
})

test("interpretThyStatement() should reject invalid variable identifier", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
  })
  assert.throws(() => interpretThyStatementBasic(context, [{ text: "$a", lineIndex: 2, columnIndex: 4 }, `is`, `f`]), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /\$a is not a valid identifier/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 2, columnIndex: 4 })
    return true
  })
})

test("interpretThyStatement() should clear thatValue and beforeThatValue if statement is assignment", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 2 },
    thatValue: 4,
    beforeThatValue: 5,
  })
  interpretThyStatementBasic(context, [`a`, `is`, `f`])
  assert.strictEqual(context.thatValue, undefined)
  assert.strictEqual(context.beforeThatValue, undefined)
})

test("interpretThyStatement() should use thatValue and beforeThatValue before clear-on-assignment", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: (a: number, b: number) => a + b },
    thatValue: 4,
    beforeThatValue: 5,
  })
  interpretThyStatementBasic(context, [`a`, `is`, `f`, `that`, `beforeThat`])
  assert.strictEqual(context.variablesInBlock.a, 9)
})

test("interpretThyStatement() should store unassigned values into `that` and `beforeThat` on a rotating basis", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: (a: number) => a },
  })

  interpretThyStatementBasic(context, [`f`, `1`])
  assert.strictEqual(context.thatValue, 1)
  assert.strictEqual(context.beforeThatValue, undefined)

  interpretThyStatementBasic(context, [`f`, `2`])
  assert.strictEqual(context.thatValue, 2)
  assert.strictEqual(context.beforeThatValue, 1)

  interpretThyStatementBasic(context, [`f`, `3`])
  assert.strictEqual(context.thatValue, 3)
  assert.strictEqual(context.beforeThatValue, 2)
})

test("interpretThyStatement() should use thatValue and beforeThatValue before context is updated", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: (a: number, b: number) => a + b },
    thatValue: 4,
    beforeThatValue: 5,
  })
  interpretThyStatementBasic(context, [`f`, `that`, `beforeThat`])
  assert.strictEqual(context.thatValue, 9)
})

test("interpretThyStatement() should set exported variables", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
  })
  interpretThyStatementBasic(context, [`export`, `a`, `is`, `f`])
  assert.strictEqual(context.variablesInBlock.a, 5)
})

test("interpretThyStatement() should set private variables", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
  })
  interpretThyStatementBasic(context, [`private`, `a`, `is`, `f`])
  assert.strictEqual(context.variablesInBlock.a, 5)
})

test("interpretThyStatement() should add exported variables to context export array", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
  })
  interpretThyStatementBasic(context, [`export`, `a`, `is`, `f`])
  assert.deepStrictEqual(context.exportedVariables, ["a"])
})

test("interpretThyStatement() should not add bare variables to context export array", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
  })
  interpretThyStatementBasic(context, [`a`, `is`, `f`])
  assert.deepStrictEqual(context.exportedVariables, [])
})

test("interpretThyStatement() should not add private variables to context export array", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
  })
  interpretThyStatementBasic(context, [`private`, `a`, `is`, `f`])
  assert.deepStrictEqual(context.exportedVariables, [])
})

test("interpretThyStatement() should add bare variables to context bare array", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
  })
  interpretThyStatementBasic(context, [`a`, `is`, `f`])
  assert.deepStrictEqual(context.bareVariables, ["a"])
})

test("interpretThyStatement() should not add exported variables to context bare array", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
  })
  interpretThyStatementBasic(context, [`export`, `a`, `is`, `f`])
  assert.deepStrictEqual(context.bareVariables, [])
})

test("interpretThyStatement() should not add private variables to context export array", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
  })
  interpretThyStatementBasic(context, [`private`, `a`, `is`, `f`])
  assert.deepStrictEqual(context.exportedVariables, [])
})

test("interpretThyStatement() should not add re-assigned variables to context bare array", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5, a: 1 },
  })
  interpretThyStatementBasic(context, [`a`, `to`, `f`])
  assert.deepStrictEqual(context.bareVariables, [])
})

test("interpretThyStatement() should not return a promise if not an await call (no assign)", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: (n: number) => n }
  })
  const thyResult = interpretThyStatementBasic(context, [`f`, `5`])
  assert.strictEqual(thyResult, undefined)
})

test("interpretThyStatement() should not return a promise if not an await call (with assign)", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: (n: number) => n }
  })
  const thyResult = interpretThyStatementBasic(context, [`a`, `is`, `f`, `5`])
  assert.strictEqual(thyResult, undefined)
})

test("interpretThyStatement() should handle await call (no assign)", async () => {
  let order = 0
  let pResolveOrder = -1
  let thyStatementResolveOrder = -1
  let resolve = (n: number) => undefined as void
  const p = new Promise<number>((r) => {
    resolve = r
  })
  p.then(() => {
    pResolveOrder = order++
  })
  const context = makeSimpleContext({
    variablesInBlock: { p: p }
  })
  const thyResult = interpretThyStatementBasic(context, [`await`, `p`])
  assert(thyResult instanceof Promise)
  thyResult.then(() => {
    thyStatementResolveOrder = order++
  })
  assert.strictEqual(context.thatValue, undefined)
  resolve(5)
  await p
  await thyResult
  assert(pResolveOrder >= 0, "p should have resolved")
  assert(thyStatementResolveOrder >= 0, "thy statement promise should have resolved")
  assert(pResolveOrder < thyStatementResolveOrder, "thy statement promise should have resolved after p")
  assert.strictEqual(context.thatValue, 5)
})

test("interpretThyStatement() should reject await call (no assign) with no arguments", async () => {
  const context = makeSimpleContext()
  assert.throws(() => interpretThyStatement(context, [{ text: "await", lineIndex: 2, columnIndex: 4 }]), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /`await` takes 1 argument/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 2, columnIndex: 4 })
    return true
  })
})

test("interpretThyStatement() should reject await call (no assign) with too many arguments", async () => {
  const context = makeSimpleContext()
  assert.throws(() => interpretThyStatementBasic(context, [{ text: "await", lineIndex: 2, columnIndex: 4 }, `1`, `1`]), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /`await` takes 1 argument/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 2, columnIndex: 4 })
    return true
  })
})

test("interpretThyStatement() should handle await call with assignment", async () => {
  let order = 0
  let pResolveOrder = -1
  let thyStatementResolveOrder = -1
  let resolve = (n: number) => undefined as void
  const p = new Promise<number>((r) => {
    resolve = r
  })
  p.then(() => {
    pResolveOrder = order++
  })
  const context = makeSimpleContext({
    variablesInBlock: { p: p }
  })
  const thyResult = interpretThyStatementBasic(context, [`a`, `is`, `await`, `p`])
  assert(thyResult instanceof Promise)
  thyResult.then(() => {
    thyStatementResolveOrder = order++
  })
  assert(!("a" in context.variablesInBlock))
  resolve(5)
  await p
  await thyResult
  assert(pResolveOrder >= 0, "p should have resolved")
  assert(thyStatementResolveOrder >= 0, "thy statement promise should have resolved")
  assert(pResolveOrder < thyStatementResolveOrder, "thy statement promise should have resolved after p")
  assert.strictEqual(context.variablesInBlock.a, 5)
})

test("interpretThyStatement() should reject await call (with assign) with no arguments", async () => {
  const context = makeSimpleContext()
  assert.throws(() => interpretThyStatementBasic(context, [`a`, `is`, { text: "await", lineIndex: 2, columnIndex: 4 }]), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /`await` takes 1 argument/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 2, columnIndex: 4 })
    return true
  })
})

test("interpretThyStatement() should reject await call (with assign) with too many arguments", async () => {
  const context = makeSimpleContext()
  assert.throws(() => interpretThyStatementBasic(context, [`a`, `is`, { text: "await", lineIndex: 2, columnIndex: 4 }, `1`, `1`]), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /`await` takes 1 argument/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 2, columnIndex: 4 })
    return true
  })
})
