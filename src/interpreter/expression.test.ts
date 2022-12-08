import assert from "node:assert"
import { test } from "under-the-sun"
import { interpretThyExpression } from "./expression"
import type { ThyBlockContext } from "./types"

const makeSimpleContext = (o: Partial<ThyBlockContext> = {}): ThyBlockContext => ({
  argsToUse: [],
  implicitArguments: null,
  variablesInBlock: {},
  ...o,
})

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

test("interpretThyExpression() barfs if variable is not found", async () => {
  const context = makeSimpleContext()
  assert.throws(() => interpretThyExpression(context, `x`), /x not found/)
})

test("interpretThyExpression() interprets array as block", async () => {
  const context = makeSimpleContext()
  const f = interpretThyExpression(context, ["return 5"])
  assert(typeof f === "function", "Expression should be a function")
  assert.strictEqual(f(), 5)
})
