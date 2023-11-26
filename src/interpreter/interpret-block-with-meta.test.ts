import assert from "node:assert"
import { test } from "under-the-sun"
import { interpretThyBlockWithMeta } from "./block"

test("interpretThyBlockWithMeta() should properly process a block that explicitly returns", async () => {
  const { interpreted, returns } = interpretThyBlockWithMeta(`return 5`)
  assert.strictEqual(returns.style, "return")
  assert.strictEqual(interpreted(), 5)
})

test("interpretThyBlockWithMeta() should properly process a block that explicitly exports", async () => {
  const { interpreted, returns } = interpretThyBlockWithMeta(`export a is\n  return 5\nprivate b is\n  return 2\nc is\n  return 3`)
  assert(returns.style === "exports")
  assert.deepStrictEqual(returns.exports, ["a"])
  assert.deepStrictEqual(interpreted(), { a: 5 })
})

test("interpretThyBlockWithMeta() should properly process a block that implicitly exports", async () => {
  const { interpreted, returns } = interpretThyBlockWithMeta(`private a is\n  return 5\nb is\n  return 2`)
  assert(returns.style === "exports")
  assert.deepStrictEqual(returns.exports, ["b"])
  assert.deepStrictEqual(interpreted(), { b: 2 })
})
