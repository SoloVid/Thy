import assert from "assert"
import { test } from "test-framework"
import { castBuiltin } from "./cast.ts"

test("cast() should return input value", async () => {
  assert.strictEqual(castBuiltin(5), 5)
})
