import assert from "node:assert"
import { test } from "under-the-sun"
import { core } from "../std-lib/core"
import { interpretThyBlock } from "./block"
import { InterpreterErrorWithContext } from "./interpreter-error"

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

test("interpretThyBlock() should return a function that can early return a called function's value via `let`", async () => {
  const interpreted = interpretThyBlock(`let f\nreturn 1`)
  const f = () => 5
  assert.strictEqual(interpreted({ f }), 5)
})

test("interpretThyBlock() should return a function that can forgo early return via `let`", async () => {
  const interpreted = interpretThyBlock(`let f\nreturn 1`)
  const f = () => undefined
  assert.strictEqual(interpreted({ f }), 1)
})

test("interpretThyBlock() should return a function that rejects `return` with no argument", async () => {
  const interpreted = interpretThyBlock(`return`)
  assert.throws(() => interpreted(), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /`return` takes exactly one parameter/)
    // assert(e instanceof InterpreterErrorWithContext)
    // assert.deepStrictEqual(e.sourceLocation, { lineIndex: 0, columnIndex: 0 })
    return true
  })
})

test("interpretThyBlock() should return a function that rejects `return` with too many arguments", async () => {
  const interpreted = interpretThyBlock(`return 1 2`)
  assert.throws(() => interpreted(), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /`return` takes exactly one parameter/)
    // assert(e instanceof InterpreterErrorWithContext)
    // assert.deepStrictEqual(e.sourceLocation, { lineIndex: 0, columnIndex: 9 })
    return true
  })
})

test("interpretThyBlock() should return a function that allows `let` with no call", async () => {
  const interpreted = interpretThyBlock(`let\nreturn 1`)
  const result = interpreted()
  assert.strictEqual(result, 1)
})

test("interpretThyBlock() should return a function that can return undefined (when no return)", async () => {
  const interpreted = interpretThyBlock(`Just a comment`)
  assert.strictEqual(interpreted(), undefined)
})

test("interpretThyBlock() should return object of exported variables", async () => {
  const interpreted = interpretThyBlock(`export a is f\nb is f\nexport c be f`)
  const f = () => 5
  assert.deepStrictEqual(interpreted({ f }), { a: 5, c: 5 })
})

test("interpretThyBlock() should return object of exported variables, appropriately mutable", async () => {
  const interpreted = interpretThyBlock(`export a be f`)
  const f = () => 5
  const result = interpreted({ f })
  assert(result !== null && typeof result === "object")
  const record = result as Record<string, unknown>
  record.a = 6
  assert.deepStrictEqual(result, { a: 6 })
})

test("interpretThyBlock() should return object of exported variables, appropriately immutable", async () => {
  const interpreted = interpretThyBlock(`export a is f`)
  const f = () => 5
  const result = interpreted({ f })
  assert(result !== null && typeof result === "object")
  const record = result as Record<string, unknown>
  assert.throws(() => record.a = 6, /a is immutable/)
  assert.deepStrictEqual(result, { a: 5 })
})

test("interpretThyBlock() should reject export after let", async () => {
  assert.throws(() => interpretThyBlock(`let f\nexport a is f`), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /`export` cannot be used after `let`/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 1, columnIndex: 0 })
    return true
  })
})

test("interpretThyBlock() should reject let after export", async () => {
  assert.throws(() => interpretThyBlock(`export a is f\nlet f`), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /`let` cannot be used after `export`/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 1, columnIndex: 0 })
    return true
  })
})

test("interpretThyBlock() should reject return after export", async () => {
  assert.throws(() => interpretThyBlock(`export a is f\nreturn 5`), (e) => {
    assert(e instanceof Error)
    assert.match(e.message, /`return` cannot be used after `export`/)
    assert(e instanceof InterpreterErrorWithContext)
    assert.deepStrictEqual(e.sourceLocation, { lineIndex: 1, columnIndex: 0 })
    return true
  })
})

test("interpretThyBlock() should return object of implicitly exported variables", async () => {
  const interpreted = interpretThyBlock(`a is f\nb is f`)
  const f = () => 5
  assert.deepStrictEqual(interpreted({ f }), { a: 5, b: 5 })
})

test("interpretThyBlock() should return object of implicitly exported variables, appropriately mutable", async () => {
  const interpreted = interpretThyBlock(`a be f`)
  const f = () => 5
  const result = interpreted({ f })
  assert(result !== null && typeof result === "object")
  const record = result as Record<string, unknown>
  record.a = 6
  assert.deepStrictEqual(result, { a: 6 })
})

test("interpretThyBlock() should return object of implicitly exported variables, appropriately immutable", async () => {
  const interpreted = interpretThyBlock(`a is f`)
  const f = () => 5
  const result = interpreted({ f })
  assert(result !== null && typeof result === "object")
  const record = result as Record<string, unknown>
  assert.throws(() => record.a = 6, /a is immutable/)
  assert.deepStrictEqual(result, { a: 5 })
})

test("interpretThyBlock() should not return object of implicitly exported variables if let was used", async () => {
  const interpreted = interpretThyBlock(`let f\na is f\nb is f`)
  const f = () => undefined
  assert.deepStrictEqual(interpreted({ f }), undefined)
})

test("interpretThyBlock() should share mutable variable state", async () => {
  const interpreted = interpretThyBlock(`a be def 1\nf is def\n  aBefore is def a\n  a to def 2\n  return aBefore`)
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
  const interpreted = interpretThyBlock(`
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
