import assert from "node:assert"
import { test } from "test-framework"
import { directoriesOf } from "./directory-utils"

test('directoriesOf("main.thy")', () => {
  assert.deepStrictEqual(directoriesOf("main.thy"), [""])
})
