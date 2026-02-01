import assert from "node:assert"
import { test } from "test-framework"
import { core } from "../std-lib/core/index.ts"
import { interpretThyBlockSource } from "./block.ts"

test("interpretThyBlock() should return a function that can return a number", async () => {
  const interpreted = interpretThyBlockSource(`return 5`)
  assert.strictEqual(interpreted(), 5)
})

test("interpretThyBlock() should return a function that can return a string", async () => {
  const interpreted = interpretThyBlockSource(`return "himom"`)
  assert.strictEqual(interpreted(), "himom")
})

test("interpretThyBlock() should properly process a block that explicitly exports", async () => {
  const interpreted = interpretThyBlockSource(
    `export a is\n  return 5\nprivate b is\n  return 2\nc is\n  return 3`,
  )
  assert.deepStrictEqual(interpreted(), { a: 5 })
})

test("interpretThyBlock() should properly process a block that implicitly exports", async () => {
  const interpreted = interpretThyBlockSource(
    `private a is\n  return 5\nb is\n  return 2`,
  )
  assert.deepStrictEqual(interpreted(), { b: 2 })
})

test("interpretThyBlock() should return a function that can return a parameter passed in", async () => {
  const interpreted = interpretThyBlockSource(`a is given\nreturn a`)
  assert.strictEqual(interpreted(42), 42)
})

test("interpretThyBlock() should return a function that can call a function passed in", async () => {
  const interpreted = interpretThyBlockSource(`a is given\na`)
  let called = false
  const f = () => (called = true)
  interpreted(f)
  assert(called, `Function should have been called`)
})

test("interpretThyBlock() should return a function that can call a function passed in with arguments", async () => {
  const interpreted = interpretThyBlockSource(`a is given\na 2 "two"`)
  let calledWithArgs: null | unknown[] = null
  const f = (...args: unknown[]) => (calledWithArgs = args)
  interpreted(f)
  assert.deepStrictEqual(calledWithArgs, [2, "two"])
})

test("interpretThyBlock() should return a function that can call a function passed in and save the result", async () => {
  const interpreted = interpretThyBlockSource(`f is given\na is f\nreturn a`)
  const f = () => 41
  assert.strictEqual(interpreted(f), 41)
})

test("interpretThyBlock() should return a function that can call a function passed in (implicit argument)", async () => {
  const interpreted = interpretThyBlockSource(`f 2 "two"`)
  let calledWithArgs: null | unknown[] = null
  const f = (...args: unknown[]) => (calledWithArgs = args)
  interpreted({ f })
  assert.deepStrictEqual(calledWithArgs, [2, "two"])
})

test("interpretThyBlock() should return a function that can early return a called function's value via `let`", async () => {
  const interpreted = interpretThyBlockSource(`let f\nreturn 1`)
  const f = () => 5
  assert.strictEqual(interpreted({ f }), 5)
})

test("interpretThyBlock() should return a function that can forgo early return via `let`", async () => {
  const interpreted = interpretThyBlockSource(`let f\nreturn 1`)
  const f = () => undefined
  assert.strictEqual(interpreted({ f }), 1)
})

test("interpretThyBlock() should return a function that allows `let` with no call", async () => {
  const interpreted = interpretThyBlockSource(`let\nreturn 1`)
  const result = interpreted()
  assert.strictEqual(result, 1)
})

test("interpretThyBlock() should return a function that can return undefined (when no return)", async () => {
  const interpreted = interpretThyBlockSource(`Just a comment`)
  assert.strictEqual(interpreted(), undefined)
})

test("interpretThyBlock() should return object of exported variables", async () => {
  const interpreted = interpretThyBlockSource(
    `export a is f\nb is f\nexport c be f`,
  )
  const f = () => 5
  assert.deepStrictEqual(interpreted({ f }), { a: 5, c: 5 })
})

test("interpretThyBlock() should return object of exported variables, appropriately mutable", async () => {
  const interpreted = interpretThyBlockSource(`export a be f`)
  const f = () => 5
  const result = interpreted({ f })
  assert(result !== null && typeof result === "object")
  const record = result as Record<string, unknown>
  record.a = 6
  assert.deepStrictEqual(result, { a: 6 })
})

test("interpretThyBlock() should return object of exported variables, appropriately immutable", async () => {
  const interpreted = interpretThyBlockSource(`export a is f`)
  const f = () => 5
  const result = interpreted({ f })
  assert(result !== null && typeof result === "object")
  const record = result as Record<string, unknown>
  assert.throws(() => (record.a = 6), /a is immutable/)
  assert.deepStrictEqual(result, { a: 5 })
})

test("interpretThyBlock() should return object of implicitly exported variables", async () => {
  const interpreted = interpretThyBlockSource(`a is f\nb is f`)
  const f = () => 5
  assert.deepStrictEqual(interpreted({ f }), { a: 5, b: 5 })
})

test("interpretThyBlock() should return object of implicitly exported variables, appropriately mutable", async () => {
  const interpreted = interpretThyBlockSource(`a be f`)
  const f = () => 5
  const result = interpreted({ f })
  assert(result !== null && typeof result === "object")
  const record = result as Record<string, unknown>
  record.a = 6
  assert.deepStrictEqual(result, { a: 6 })
})

test("interpretThyBlock() should return object of implicitly exported variables, appropriately immutable", async () => {
  const interpreted = interpretThyBlockSource(`a is f`)
  const f = () => 5
  const result = interpreted({ f })
  assert(result !== null && typeof result === "object")
  const record = result as Record<string, unknown>
  assert.throws(() => (record.a = 6), /a is immutable/)
  assert.deepStrictEqual(result, { a: 5 })
})

test("interpretThyBlock() should not return object of implicitly exported variables if let was used", async () => {
  const interpreted = interpretThyBlockSource(`let f\na is g\nb is g`)
  const f = () => undefined
  const g = () => 5
  assert.deepStrictEqual(interpreted({ f, g }), undefined)
})

test("interpretThyBlock() should share mutable variable state", async () => {
  const interpreted = interpretThyBlockSource(
    `a be def 1\nf is def\n  aBefore is def a\n  a to def 2\n  return aBefore`,
  )
  const result = interpreted({ def: (a: unknown) => a })
  assert(result !== null && typeof result === "object")
  const record = result as Record<string, unknown>
  assert.strictEqual(record.a, 1)
  assert(typeof record.f === "function")
  record.a = 3
  assert.strictEqual(record.a, 3)
  // This should return `a` as is and set `a` to 2.
  const aFromF = record.f()
  assert.strictEqual(aFromF, 3)
  assert.strictEqual(record.a, 2)
})

test("interpretThyBlock() should support recursion", async () => {
  const interpreted = interpretThyBlockSource(`
factorial is def
  n is given
  check.asc n 1
  let if that
    return 1
  and else
    math.subtract n 1
    factorial that
    math.multiply n that
    return that
factorial 4
return that
`)
  const result = interpreted(core)
  assert.strictEqual(result, 24)
})

test("interpretThyBlock() replaces `that` with preceding value", async () => {
  const interpreted = interpretThyBlockSource(`
def 1
def 2
math.add that that
return that
`)
  const result = interpreted(core)
  assert.strictEqual(result, 3)
})

test("interpretThyBlock() replaces `that` with preceding value when used as base for property access", async () => {
  const interpreted = interpretThyBlockSource(`
makeThing
return that.a
`)
  const result = interpreted({ makeThing: () => ({ a: 5 }) })
  assert.strictEqual(result, 5)
})

test("interpretThyBlock() should overwrite mutable variable with result of function call", async () => {
  const interpreted = interpretThyBlockSource(`
a be def 50
a to f a
return a
`)
  const result = interpreted({ ...core, f: (a: number) => a + 1 })
  assert.strictEqual(result, 51)
})
