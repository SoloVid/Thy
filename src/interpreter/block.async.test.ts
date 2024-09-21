import assert from "node:assert"
import { test } from "test-framework"
import { interpretThyBlockSource } from "./block"

test("interpretThyBlock() should return an async function if the block contains `await` call-only line", async () => {
  const interpreted = interpretThyBlockSource(`await 5\nreturn that`)
  const result = interpreted()
  assert(
    result instanceof Promise,
    "Return value from interpreted block should be a promise",
  )
  const awaitedResult = await result
  assert.strictEqual(awaitedResult, 5)
})

test("interpretThyBlock() should return an async function if the block contains `await` assignment statement", async () => {
  const interpreted = interpretThyBlockSource(`a is await 5\nreturn a`)
  const result = interpreted()
  assert(
    result instanceof Promise,
    "Return value from interpreted block should be a promise",
  )
  const awaitedResult = await result
  assert.strictEqual(awaitedResult, 5)
})

test("interpretThyBlock() can return an async function that can early return a called function's value via `let`", async () => {
  const interpreted = interpretThyBlockSource(`f\nlet await that\nreturn 1`)
  const f = () => new Promise((resolve) => setTimeout(() => resolve(5), 10))
  const result = interpreted({ f })
  assert(
    result instanceof Promise,
    "Return value from interpreted block should be a promise",
  )
  const awaitedResult = await result
  assert.strictEqual(awaitedResult, 5)
})

test("interpretThyBlock() can return an async function that can forgo early return via `let`", async () => {
  const interpreted = interpretThyBlockSource(`f\nlet await that\nreturn 1`)
  const f = () =>
    new Promise((resolve) => setTimeout(() => resolve(undefined), 10))
  const result = interpreted({ f })
  assert(
    result instanceof Promise,
    "Return value from interpreted block should be a promise",
  )
  const awaitedResult = await result
  assert.strictEqual(awaitedResult, 1)
})

test("interpretThyBlock() can return an async function that can handle await call (no assign) in that", async () => {
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
  const interpreted = interpretThyBlockSource(`await p\nreturn that`)
  const thyResult = interpreted({ p })
  assert(thyResult instanceof Promise)
  thyResult.then(() => {
    thyStatementResolveOrder = order++
  })
  resolve(5)
  await p
  const valueResult = await thyResult
  assert(pResolveOrder >= 0, "p should have resolved")
  assert(
    thyStatementResolveOrder >= 0,
    "thy statement promise should have resolved",
  )
  assert(
    pResolveOrder < thyStatementResolveOrder,
    "thy statement promise should have resolved after p",
  )
  assert.strictEqual(valueResult, 5)
})
