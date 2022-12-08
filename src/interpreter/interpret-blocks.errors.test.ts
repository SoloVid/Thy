import assert from "assert"
import { test } from "under-the-sun"
import { interpretThyBlock } from "./block"

test("interpretThyBlock() should reject given with too many args", async () => {
  const f = interpretThyBlock(`a is given 1 2`)
  assert.throws(() => f(), /given may only take one argument/)
})
