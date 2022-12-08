import assert from "assert"
import { test } from "under-the-sun"
import { interpretThyBlock } from "./block"

test("interpretThyBlock() can return a function that can pass a function to another", async () => {
  const interpreted = interpretThyBlock(`f\n  return 4`)
  let calledWith: unknown = null
  const f = (arg: unknown) => calledWith = arg
  interpreted({ f })
  assert(typeof calledWith === "function", "Argument passed to function should have also been a function")
  assert.strictEqual(calledWith(), 4)
})
