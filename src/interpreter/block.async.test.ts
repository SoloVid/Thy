import assert from "node:assert"
import { test } from "under-the-sun"
import { interpretThyBlock } from "./block"

test("interpretThyBlock() should return an async function if the block contains `await` call-only line", async () => {
  const interpreted = interpretThyBlock(`await 5\nreturn that`)
  const result = interpreted()
  assert(result instanceof Promise, "Return value from interpreted block should be a promise")
  const awaitedResult = await result
  assert.strictEqual(awaitedResult, 5)
})

test("interpretThyBlock() should return an async function if the block contains `await` assignment statement", async () => {
  const interpreted = interpretThyBlock(`a is await 5\nreturn a`)
  const result = interpreted()
  assert(result instanceof Promise, "Return value from interpreted block should be a promise")
  const awaitedResult = await result
  assert.strictEqual(awaitedResult, 5)
})

test("interpretThyBlock() can return an async function that can early return a called function's value via `let`", async () => {
  const interpreted = interpretThyBlock(`f\nlet await that\nreturn 1`)
  const f = () => new Promise((resolve) => setTimeout(() => resolve(5), 10))
  const result = interpreted({ f })
  assert(result instanceof Promise, "Return value from interpreted block should be a promise")
  const awaitedResult = await result
  assert.strictEqual(awaitedResult, 5)
})

test("interpretThyBlock() can return an async function that can forgo early return via `let`", async () => {
  const interpreted = interpretThyBlock(`f\nlet await that\nreturn 1`)
  const f = () => new Promise((resolve) => setTimeout(() => resolve(undefined), 10))
  const result = interpreted({ f })
  assert(result instanceof Promise, "Return value from interpreted block should be a promise")
  const awaitedResult = await result
  assert.strictEqual(awaitedResult, 1)
})

test("interpretThyBlock() can return an async function that rejects `let await` with no arguments", async () => {
  const interpreted = interpretThyBlock(`let await`)
  await assert.rejects(async () => interpreted({}), /`await` takes 1 argument/)
})

test("interpretThyBlock() can return an async function that rejects `let await` with too many arguments", async () => {
  const interpreted = interpretThyBlock(`let await 1 2`)
  await assert.rejects(async () => interpreted({}), /`await` takes 1 argument/)
})
