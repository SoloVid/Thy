import assert from "assert"
import { test } from "under-the-sun"
import { defBuiltin } from "./def"

test("def() should return input value", async () => {
  assert.strictEqual(defBuiltin(5), 5)
})
