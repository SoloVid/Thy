import assert from "assert"
import StackTracey from "stacktracey"
import { test } from "under-the-sun"
import { delay } from "../utils/delay"
import { getErrorTraceLines } from "../utils/error-helper"
import { interpretThyBlock } from "./block"

test("interpretThyBlock() should reject given with too many args", async () => {
  const f = interpretThyBlock(`a is given 1 2`)
  assert.throws(() => f(), /given may only take one argument/)
})

test("interpretThyBlock() should provide Thy stack trace when error is thrown", async () => {
  const interpreted = interpretThyBlock(`f is given\nf`, {
    functionName: "interpreted",
    sourceFile: "provided-source-value",
  })
  function foo() {
    throw new Error("f bad")
  }
  await delay(10)
  const errorHere = new Error(`  at null.f (c:\\Users\\User\\some-file.ts:15:11)
  at async Object.run (C:\\Users\\User\\node_modules\\under-the-sun\\lib\\index.js:1:1834)`)
  // const errorHereStack = new StackTracey(errorHere)
  console.log(errorHere.stack)
  // console.log(errorHereStack.items)
  let actualError: unknown = null
  try {
    interpreted(foo)
  } catch (e) {
    actualError = e
  }
  assert.notStrictEqual(actualError, null, "Error should be thrown")
  assert(actualError instanceof Error)
  console.log(actualError.stack)
  const traceLines = getErrorTraceLines(actualError).split("\n")
  console.log("=====")
  console.log(traceLines)
  assert(traceLines.length >= 3, "Trace should be at least three lines for assertions")
  assert.match(traceLines[0], /\bfoo\b/)
  assert.match(traceLines[0], /\binterpret-block.errors.test.ts\b/)
  assert.match(traceLines[1], /\binterpreted\b/)
  assert.match(traceLines[1], /\bprovided-source-value:2:1\b/)
  const hereLines = getErrorTraceLines(errorHere).split("\n")
  assert(hereLines.length >= 1, "Trace should be at least three lines for assertions")
  console.log(hereLines)
  const expectedHereLine = hereLines[0].replace(/:\d+:\d+/, ":XXX:XXX")
  const actualHereLine = traceLines[2].replace(/:\d+:\d+/, ":XXX:XXX")
  assert.strictEqual(actualHereLine, expectedHereLine)
  // assert.strictEqual(actualError.stack, errorHere.stack)
  // assert.throws(() => interpreted(f), (e) => {
  //   assert(e instanceof Error)
  //   console.log(e.stack)
  //   assert.strictEqual(e.stack, errorHere.stack)
  //   return true
  // })
  // assert.strictEqual(interpreted(f), 41)
})
