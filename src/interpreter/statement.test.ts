import type { CompileError } from "common/compile-error.ts"
import { expect } from "expect"
import assert from "node:assert"
import { parseBlockInner } from "parser/parse-block.ts"
import { makeParserState } from "parser/parser-state.ts"
import { test } from "test-framework"
import { makeTokenizer } from "tokenizer"
import { isAssignment, isCall } from "tree"
import { InterpreterErrorWithContext } from "./interpreter-error.ts"
import { interpretThyStatement } from "./statement.ts"
import { makeSimpleContext } from "./test-helper.ts"
import type { ThyBlockContext } from "./types.ts"

function interpretThyStatementBasic(context: ThyBlockContext, source: string) {
  const errors: CompileError[] = []
  const tokenizer = makeTokenizer(source, errors)
  const parserState = makeParserState(tokenizer, errors)
  const block = parseBlockInner(parserState)
  expect(errors).toEqual([])
  assert(block.ideas.length === 1, "parsed block should have 1 idea")
  const statement = block.ideas[0]
  assert(
    isCall(statement) || isAssignment(statement),
    "parsed idea should be a call or assignment",
  )
  const raw = interpretThyStatement(context, statement)
  assert(!raw.wait, "This test case should not be handling async")
  return raw.value
}

test("interpretThyStatement() should call function", async () => {
  let called = false
  const context = makeSimpleContext({
    variablesInBlock: { f: () => (called = true) },
  })
  interpretThyStatementBasic(context, `f`)
  assert(called, "Function should have been called")
})

test("interpretThyStatement() should call function with arguments", async () => {
  let calledWith: unknown = null
  const context = makeSimpleContext({
    variablesInBlock: { f: (a: unknown) => (calledWith = a) },
  })
  interpretThyStatementBasic(context, `f 67`)
  assert.strictEqual(calledWith, 67, "Function should have been called")
})

test("interpretThyStatement() should save result of function call in an immutable variable", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: (a: number) => a + 1 },
  })
  interpretThyStatementBasic(context, `a is f 67`)
  assert.strictEqual(context.variablesInBlock["a"], 68)
})

test("interpretThyStatement() should save result of function call in a mutable variable", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: (a: number) => a + 1 },
  })
  interpretThyStatementBasic(context, `a be f 67`)
  assert.strictEqual(context.variablesInBlock["a"], 68)
})

test("interpretThyStatement() should reject attempt to shadow variable from closure", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
    closure: { a: 1 },
  })
  assert.throws(
    () => interpretThyStatementBasic(context, `a be f`),
    (e) => {
      assert(e instanceof Error)
      assert.match(e.message, /a cannot be shadowed/)
      assert(e instanceof InterpreterErrorWithContext)
      assert.deepStrictEqual(e.sourceLocation, { line: 0, column: 0 })
      return true
    },
  )
})

test("interpretThyStatement() should set exported variables", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
  })
  interpretThyStatementBasic(context, `export a is f`)
  assert.strictEqual(context.variablesInBlock.a, 5)
})

test("interpretThyStatement() should set private variables", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 5 },
  })
  interpretThyStatementBasic(context, `private a is f`)
  assert.strictEqual(context.variablesInBlock.a, 5)
})

test("interpretThyStatement() should not return a promise if not an await call (no assign)", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: (n: number) => n },
  })
  const thyResult = interpretThyStatementBasic(context, `f 5`)
  assert.strictEqual(thyResult, undefined)
})

test("interpretThyStatement() should not return a promise if not an await call (with assign)", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: (n: number) => n },
  })
  const thyResult = interpretThyStatementBasic(context, `a is f 5`)
  assert.strictEqual(thyResult, undefined)
})
