import assert from "node:assert"
import { test } from "test-framework"
import { interpretThyBlockSourceWithMeta } from "./block"

test("interpretThyBlockWithMeta() should properly process a block that explicitly returns", async () => {
  const { interpreted } = interpretThyBlockSourceWithMeta(`return 5`)
  assert.strictEqual(interpreted(), 5)
})

test("interpretThyBlockWithMeta() should properly process a block that explicitly exports", async () => {
  const { interpreted } = interpretThyBlockSourceWithMeta(
    `export a is\n  return 5\nprivate b is\n  return 2\nc is\n  return 3`,
  )
  assert.deepStrictEqual(interpreted(), { a: 5 })
})

test("interpretThyBlockWithMeta() should properly process a block that implicitly exports", async () => {
  const { interpreted } = interpretThyBlockSourceWithMeta(
    `private a is\n  return 5\nb is\n  return 2`,
  )
  assert.deepStrictEqual(interpreted(), { b: 2 })
})
