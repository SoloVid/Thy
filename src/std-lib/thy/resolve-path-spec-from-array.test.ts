import { test } from "test-framework"
import { resolvePathSpecFromArray } from "./resolve-path-spec-from-array"
import assert from "node:assert"

test("resolvePathSpecFromArray() should resolve singleton", () => {
  const result = resolvePathSpecFromArray("main.thy", ["main.thy"], "main.thy")
  assert.deepStrictEqual(result, ["main.thy"])
})
