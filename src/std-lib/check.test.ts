import assert from "assert"
import { test } from "under-the-sun"
import { allBuiltin, ascBuiltin, descBuiltin, equalBuiltin, notBuiltin, someBuiltin } from "./check"

function testCheckFunction<T>(f: (a: T, b?: T, c?: T, d?: T) => boolean, testPairs: [[T]|[T,T]|[T,T,T]|[T,T,T,T],boolean][]) {
  for (const [args, expectedOutput] of testPairs) {
    assert.strictEqual(f(...(args as Parameters<typeof f>)), expectedOutput, `Failure for ${JSON.stringify(args)}`)
  }
}

test("all() should be logical AND", async () => {
  testCheckFunction(allBuiltin, [
    [[true], true],
    [[false], false],
    [[true, true], true && true],
    [[true, false], true && false],
    [[false, true], false && true],
    [[false, false], false && false],
    [[true, true, true], true && true && true],
    [[true, true, false], true && true && false],
    [[false, true, true], false && true && true],
    [[false, true, false], false && true && false],
    [[true, true, true, true], true && true && true && true],
    [[true, true, true, false], true && true && true && false],
    [[false, true, true, true], false && true && true && true],
    [[false, true, true, false], false && true && true && false],
  ])
})

test("some() should be logical OR", async () => {
  testCheckFunction(someBuiltin, [
    [[true], true],
    [[false], false],
    [[true, true], true || true],
    [[true, false], true || false],
    [[false, true], false || true],
    [[false, false], false || false],
    [[true, false, true], true || false || true],
    [[true, false, false], true || false || false],
    [[false, false, true], false || false || true],
    [[false, false, false], false || false || false],
    [[true, false, false, true], true || false || false || true],
    [[true, false, false, false], true || false || false || false],
    [[false, false, false, true], false || false || false || true],
    [[false, false, false, false], false || false || false || false],
  ])
})

test("asc() should be logical <", async () => {
  testCheckFunction(ascBuiltin, [
    [[1], true],
    [[1, 2], 1 < 2],
    [[2, 1], 2 < 1],
    [[1, 2, 3], 1 < 2 && 2 < 3],
    [[1, 3, 2], 1 < 3 && 3 < 2],
    [[2, 1, 3], 2 < 1 && 1 < 3],
    [[2, 3, 1], 2 < 3 && 3 < 1],
    [[3, 1, 2], 3 < 1 && 1 < 2],
    [[3, 2, 1], 3 < 2 && 2 < 1],
    [[1, 2, 3, 4], 1 < 2 && 2 < 3 && 3 < 4],
    [[4, 1, 2, 3], 4 < 1 && 1 < 2 && 2 < 3],
  ])
})

test("desc() should be logical >", async () => {
  testCheckFunction(descBuiltin, [
    [[1], true],
    [[1, 2], 1 > 2],
    [[2, 1], 2 > 1],
    [[1, 2, 3], 1 > 2 && 2 > 3],
    [[1, 3, 2], 1 > 3 && 3 > 2],
    [[2, 1, 3], 2 > 1 && 1 > 3],
    [[2, 3, 1], 2 > 3 && 3 > 1],
    [[3, 1, 2], 3 > 1 && 1 > 2],
    [[3, 2, 1], 3 > 2 && 2 > 1],
    [[1, 2, 3, 4], 1 > 2 && 2 > 3 && 3 > 4],
    [[4, 1, 2, 3], 4 > 1 && 1 > 2 && 2 > 3],
  ])
})

test("equal() should be logical ===", async () => {
  testCheckFunction(equalBuiltin, [
    [[1], true],
    [[1, 1], true],
    [[1, 2], false],
    [[1, 1, 1], true],
    [[1, 1, 2], false],
    [[1, 1, 1, 1], true],
    [[1, 1, 1, 2], false],
  ])
})

test("not() should negate boolean", async () => {
  assert.strictEqual(notBuiltin(true), false)
  assert.strictEqual(notBuiltin(false), true)
})
