import assert from "assert"
import { test } from "under-the-sun"
import { interpretThyBlock } from "./block"

test("interpretThyBlock() should return a function that can return a number", async () => {
  const interpreted = interpretThyBlock(`return 5`)
  assert.strictEqual(interpreted(), 5)
})

test("interpretThyBlock() should return a function that can return a string", async () => {
  const interpreted = interpretThyBlock(`return "himom"`)
  assert.strictEqual(interpreted(), "himom")
})

test("interpretThyBlock() should return a function that can return a parameter passed in", async () => {
  const interpreted = interpretThyBlock(`a is given\nreturn a`)
  assert.strictEqual(interpreted(42), 42)
})

test("interpretThyBlock() should return a function that can call a function passed in", async () => {
  const interpreted = interpretThyBlock(`a is given\na`)
  let called = false
  const f = () => called = true
  interpreted(f)
  assert(called, `Function should have been called`)
})

test("interpretThyBlock() should return a function that can call a function passed in with arguments", async () => {
  const interpreted = interpretThyBlock(`a is given\na 2 "two"`)
  let calledWithArgs: null|unknown[] = null
  const f = (...args: unknown[]) => calledWithArgs = args
  interpreted(f)
  assert.deepStrictEqual(calledWithArgs, [2, "two"])
})

test("interpretThyBlock() should return a function that can call a function passed in and save the result", async () => {
  const interpreted = interpretThyBlock(`f is given\na is f\nreturn a`)
  const f = () => 41
  assert.strictEqual(interpreted(f), 41)
})

test("interpretThyBlock() should return a function that can call a function passed in (implicit argument)", async () => {
  const interpreted = interpretThyBlock(`f 2 "two"`)
  let calledWithArgs: null|unknown[] = null
  const f = (...args: unknown[]) => calledWithArgs = args
  interpreted({ f })
  assert.deepStrictEqual(calledWithArgs, [2, "two"])
})
