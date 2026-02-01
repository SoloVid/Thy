import assert from "node:assert"
import { test } from "test-framework"
import { directoriesOf } from "./directory-utils.ts"

test('directoriesOf("main.thy")', () => {
  assert.deepStrictEqual(directoriesOf("main.thy"), [""])
})
