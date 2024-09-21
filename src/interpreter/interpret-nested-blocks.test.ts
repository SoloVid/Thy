import assert from "assert"
import { defBuiltin } from "std-lib/core/def"
import { math } from "std-lib/core/math"
import { test } from "test-framework"
import { interpretThyBlockSource } from "./block"

test("interpretThyBlock() can return a function that can pass a function to another", async () => {
  const interpreted = interpretThyBlockSource(`f\n  return 4`)
  let calledWith: unknown = null
  const f = (arg: unknown) => (calledWith = arg)
  interpreted({ f })
  assert(
    typeof calledWith === "function",
    "Argument passed to function should have also been a function",
  )
  assert.strictEqual(calledWith(), 4)
})

test("interpretThyBlock() can return a function that can pass a multiline string to a function", async () => {
  const interpreted = interpretThyBlockSource(
    `f """\n  yo\n  sup\n\nf """\n  again`,
  )
  let calledWith: unknown[] = []
  const f = (arg: unknown) => calledWith.push(arg)
  interpreted({ f })
  assert.deepStrictEqual(calledWith, ["yo\nsup", "again"])
})

test("interpretThyBlock() can return a function that can pass context through multiple layers of blocks", async () => {
  const interpreted = interpretThyBlockSource(
    `a is\n  b is\n    c is\n      d is f 1\n      return d\n    return c\n  return b\nreturn a`,
  )
  let calledWith: unknown = null
  const f = (arg: number) => {
    calledWith = arg
    return arg + 1
  }
  const result = interpreted({ f })
  assert.strictEqual(calledWith, 1)
  assert.strictEqual(result, 2)
})

test("interpretThyBlock() can return a function that can enclose (closure) variables for inner blocks", async () => {
  const interpreted = interpretThyBlockSource(
    `x be def 5\nfoo is def\n  bar is def\n    x to math.add x 2\n  bar\nfoo\nreturn x`,
  )
  const result = interpreted({ def: defBuiltin, math: math })
  assert.strictEqual(result, 7)
})

test("interpretThyBlock() track local (single scope) mutable variables", async () => {
  const interpreted = interpretThyBlockSource(
    `x be def 5\nx to inc x\nx to inc x\nreturn x`,
  )
  const result = interpreted({ def: defBuiltin, inc: (n: number) => n + 1 })
  assert.strictEqual(result, 7)
})
