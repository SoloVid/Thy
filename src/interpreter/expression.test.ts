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
