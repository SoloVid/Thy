import assert from "assert"
import { test } from "under-the-sun"
import { castBuiltin } from "./cast"

test("cast() should return input value", async () => {
  assert.strictEqual(castBuiltin(5), 5)
})
