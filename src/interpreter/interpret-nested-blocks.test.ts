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

test("interpretThyBlock() can return a function that can pass context through multiple layers of blocks", async () => {
  const interpreted = interpretThyBlock(`a is\n  b is\n    c is\n      d is f 1\n      return d\n    return c\n  return b\nreturn a`)
  let calledWith: unknown = null
  const f = (arg: number) => {
    calledWith = arg
    return arg + 1
  }
  const result = interpreted({ f })
  assert.strictEqual(calledWith, 1)
  assert.strictEqual(result, 2)
})
