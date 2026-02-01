import assert from "assert"
import { test } from "test-framework"
import { defBuiltin } from "./def.ts"

test("def() should return input value", async () => {
  assert.strictEqual(defBuiltin(5), 5)
})
