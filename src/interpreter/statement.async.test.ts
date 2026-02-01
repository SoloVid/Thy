import type { CompileError } from "common/compile-error.ts"
import { expect } from "expect"
import assert from "node:assert"
import { parseBlockInner } from "parser/parse-block.ts"
import { makeParserState } from "parser/parser-state.ts"
import { test } from "test-framework"
import { makeTokenizer } from "tokenizer"
import { isAssignment, isCall } from "tree"
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
  const result = interpretThyStatement(context, statement)
  assert(result.wait, "This test should only be handling async stuff")
  return result.promise
}

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
    variablesInBlock: { p: p },
  })
  const thyResult = interpretThyStatementBasic(context, `a is await p`)
  assert(thyResult instanceof Promise)
  thyResult.then(() => {
    thyStatementResolveOrder = order++
  })
  assert(!("a" in context.variablesInBlock))
  resolve(5)
  await p
  await thyResult
  assert(pResolveOrder >= 0, "p should have resolved")
  assert(
    thyStatementResolveOrder >= 0,
    "thy statement promise should have resolved",
  )
  assert(
    pResolveOrder < thyStatementResolveOrder,
    "thy statement promise should have resolved after p",
  )
  assert.strictEqual(context.variablesInBlock.a, 5)
})
