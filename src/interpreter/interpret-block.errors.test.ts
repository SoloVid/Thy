import assert from "assert"
import { test } from "under-the-sun"
import { delay } from "../utils/delay"
import { getErrorTraceLines } from "../utils/error-helper"
import { interpretThyBlock } from "./block"

test("interpretThyBlock() should reject given with too many args", async () => {
  const f = interpretThyBlock(`a is given 1 2`)
  assert.throws(() => f(), /given may only take one argument/)
})

test("interpretThyBlock() should provide Thy stack trace when error is thrown", () => {
  // Make sure async stack traces are homogenous.
  // await delay(10)

  const interpreted = interpretThyBlock(`f is given\nf`, {
    functionName: "interpreted",
    sourceFile: "provided-source.thy",
  })
  function foo() {
    throw new Error("f bad")
  }

  const errorHere = new Error()
  const hereLines = getErrorTraceLines(errorHere).split("\n")
  assert(hereLines.length >= 1, "Trace should be at least three lines for assertions")

  let actualError: unknown = null
  try {
    interpreted(foo)
  } catch (e) {
    actualError = e
  }

  assert.notStrictEqual(actualError, null, "Error should be thrown")
  assert(actualError instanceof Error)
  // console.log(actualError)

  assertErrorTraceLineMatch(actualError, 0, /\bfoo\b/)
  assertErrorTraceLineMatch(actualError, 0, /\binterpret-block.errors.test.ts\b/)
  assertErrorTraceLineMatch(actualError, 1, /\binterpreted\b/)
  assertErrorTraceLineMatch(actualError, 1, /\bprovided-source.thy:2:1\b/)
  assertErrorTraceLinesMatch(actualError, 2, errorHere, 0)

  // const traceLines = getErrorTraceLines(actualError).split("\n")
  // assert(traceLines.length >= 3, "Trace should be at least three lines for assertions")
  // assert.match(traceLines[0], /\bfoo\b/)
  // assert.match(traceLines[0], /\binterpret-block.errors.test.ts\b/)
  // assert.match(traceLines[1], /\binterpreted\b/)
  // assert.match(traceLines[1], /\bprovided-source.thy:2:1\b/)
  // const expectedHereLine = hereLines[0].replace(/:\d+:\d+/, ":XXX:XXX")
  // const actualHereLine = traceLines[2].replace(/:\d+:\d+/, ":XXX:XXX")
  // assert.strictEqual(actualHereLine, expectedHereLine)
})

test("interpretThyBlock() should provide Thy stack trace when error is thrown asynchronously", async () => {
  const interpreted = interpretThyBlock(`f is given\nf\nawait that`, {
    functionName: "interpreted",
    sourceFile: "provided-source.thy",
  })
  async function foo() {
    await delay(10)
    throw new Error("f bad")
  }

  // Make sure async stack traces are homogenous.
  await delay(10)

  const errorHere = new Error()
  const hereLines = getErrorTraceLines(errorHere).split("\n")
  assert(hereLines.length >= 1, "Trace should be at least three lines for assertions")

  let actualError: unknown = null
  try {
    console.log("before interpreted")
    await interpreted(foo)
    // throw new Error("agggh")
  } catch (e) {
    console.log("catch")
    actualError = e
  }

  assert.notStrictEqual(actualError, null, "Error should be thrown")
  assert(actualError instanceof Error)

  // console.log(getErrorTraceLines(actualError))

  assertErrorTraceLineMatch(actualError, 0, /\bfoo\b/)
  assertErrorTraceLineMatch(actualError, 0, /\binterpret-block.errors.test.ts\b/)
  assertErrorTraceLineMatch(actualError, 1, /\binterpreted\b/)
  assertErrorTraceLineMatch(actualError, 1, /\bprovided-source.thy:3:1\b/)
  assertErrorTraceLinesMatch(actualError, 2, errorHere, 0)

  // const traceLines = getErrorTraceLines(actualError).split("\n")
  // assert(traceLines.length >= 3, "Trace should be at least three lines for assertions")
  // assert.match(traceLines[0], /\bfoo\b/)
  // assert.match(traceLines[0], /\binterpret-block.errors.test.ts\b/)
  // assert.match(traceLines[1], /\binterpreted\b/)
  // assert.match(traceLines[1], /\bprovided-source-value:3:1\b/)
  // const expectedHereLine = hereLines[0].replace(/:\d+:\d+/, ":XXX:XXX")
  // const actualHereLine = traceLines[2].replace(/:\d+:\d+/, ":XXX:XXX")
  // assert.strictEqual(actualHereLine, expectedHereLine)
})

test("interpretThyBlock() should provide Thy stack trace when error is thrown synchronously from async code", async () => {
  const interpreted = interpretThyBlock(`f is given\nf\nawait that`, {
    functionName: "interpreted",
    sourceFile: "provided-source.thy",
  })
  async function foo() {
    throw new Error("f bad")
  }

  // Make sure async stack traces are homogenous.
  await delay(10)

  const errorHere = new Error()
  const hereLines = getErrorTraceLines(errorHere).split("\n")
  assert(hereLines.length >= 1, "Trace should be at least three lines for assertions")

  let actualError: unknown = null
  try {
    console.log("before interpreted")
    const p = interpreted(foo)
    await p
    // throw new Error("agggh")
  } catch (e) {
    console.log("catch")
    actualError = e
  }

  assert.notStrictEqual(actualError, null, "Error should be thrown")
  assert(actualError instanceof Error)

  // console.log(getErrorTraceLines(actualError))

  // const traceLines = getErrorTraceLines(actualError).split("\n")
  // assert(traceLines.length >= 3, "Trace should be at least three lines for assertions")
  assertErrorTraceLineMatch(actualError, 0, /\bfoo\b/)
  assertErrorTraceLineMatch(actualError, 0, /\binterpret-block.errors.test.ts\b/)
  assertErrorTraceLineMatch(actualError, 1, /\binterpreted\b/)
  assertErrorTraceLineMatch(actualError, 1, /\bprovided-source.thy:3:1\b/)
  assertErrorTraceLinesMatch(actualError, 2, errorHere, 0)
})

test("interpretThyBlock() should provide Thy stack trace when error is thrown synchronously from async code", async () => {
  const interpreted = interpretThyBlock(`f is given\nf\ng is await that`, {
    functionName: "interpreted",
    sourceFile: "provided-source.thy",
  })
  async function foo() {
    throw new Error("f bad")
  }

  // Make sure async stack traces are homogenous.
  await delay(10)

  const errorHere = new Error()
  const hereLines = getErrorTraceLines(errorHere).split("\n")
  assert(hereLines.length >= 1, "Trace should be at least three lines for assertions")

  let actualError: unknown = null
  try {
    console.log("before interpreted")
    const p = interpreted(foo)
    await p
    // throw new Error("agggh")
  } catch (e) {
    console.log("catch")
    actualError = e
  }

  assert.notStrictEqual(actualError, null, "Error should be thrown")
  assert(actualError instanceof Error)

  // console.log(getErrorTraceLines(actualError))

  // const traceLines = getErrorTraceLines(actualError).split("\n")
  // assert(traceLines.length >= 3, "Trace should be at least three lines for assertions")
  assertErrorTraceLineMatch(actualError, 0, /\bfoo\b/)
  assertErrorTraceLineMatch(actualError, 0, /\binterpret-block.errors.test.ts\b/)
  assertErrorTraceLineMatch(actualError, 1, /\binterpreted\b/)
  assertErrorTraceLineMatch(actualError, 1, /\bprovided-source.thy:3:6\b/)
  assertErrorTraceLinesMatch(actualError, 2, errorHere, 0)
})

function assertErrorTraceLineMatch(error: Error, lineIndex: number, pattern: RegExp) {
  const traceLinesString = getErrorTraceLines(error)
  const traceLines = traceLinesString.split("\n")
  assert(traceLines.length > lineIndex, `Error trace should be more than ${lineIndex} lines. Got:\n${traceLinesString}\n<end trace>`)
  assert.match(traceLines[lineIndex], pattern, `Error trace line ${lineIndex + 1} did not match pattern ${pattern.toString()}\n${traceLinesString}\n<end trace>`)
}

function assertErrorTraceLinesMatch(actualError: Error, actualErrorLineIndex: number, expectedError: Error, expectedErrorLineIndex: number) {
  const traceLinesString = getErrorTraceLines(actualError)
  const traceLines = traceLinesString.split("\n")
  assert(traceLines.length > actualErrorLineIndex, `Error trace should be more than ${actualErrorLineIndex} lines. Got:\n${traceLinesString}\n<end trace>`)
  const actualLine = traceLines[actualErrorLineIndex].replace(/:\d+:\d+/, ":XXX:XXX")

  const expectedTraceLinesString = getErrorTraceLines(expectedError)
  const expectedTraceLines = expectedTraceLinesString.split("\n")
  assert(expectedTraceLines.length > expectedErrorLineIndex, `Error trace should be more than ${expectedErrorLineIndex} lines. Got:\n${expectedTraceLinesString}\n<end trace>`)
  const expectedLine = expectedTraceLines[expectedErrorLineIndex].replace(/:\d+:\d+/, ":XXX:XXX")
  assert.strictEqual(actualLine, expectedLine, `Line ${actualErrorLineIndex + 1} of actual error should match line ${expectedErrorLineIndex + 1} of expected error\nActual:\n${traceLinesString}\nExpected:\n${expectedTraceLinesString}\n<end trace>`)
}
