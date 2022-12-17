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

test("interpretThyBlock() can return a function that can pass a multiline string to a function", async () => {
  const interpreted = interpretThyBlock(`f """\n  yo\n  sup\n\nf """\n  again`)
  let calledWith: unknown[] = []
  const f = (arg: unknown) => calledWith.push(arg)
  interpreted({ f })
  assert.deepStrictEqual(calledWith, [
    "yo\nsup",
    "again",
  ])
})
