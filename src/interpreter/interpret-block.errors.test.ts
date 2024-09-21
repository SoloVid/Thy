import assert from "node:assert"
import { test } from "test-framework"
import { delay } from "utils/delay"
import { getErrorTraceLines } from "utils/error-helper"
import { interpretThyBlockSource } from "./block"

// Wallaby messes with stack traces in ways that make some of these tests fail.
function nonWallabyTest(
  description: string,
  exercise: () => void | PromiseLike<void>,
) {
  if (!process?.env?.WALLABY) {
    test(description, exercise)
  }
}

test("interpretThyBlock() should provide Thy stack trace when error is thrown synchronously", () => {
  const interpreted = interpretThyBlockSource(`f is given\nf`, {
    functionName: "interpreted",
    sourceFile: "provided-source.thy",
  })
  function foo() {
    throw new Error("f bad")
  }

  const errorHere = new Error()

  let actualError: unknown = null
  try {
    interpreted(foo)
  } catch (e) {
    actualError = e
  }

  assert.notStrictEqual(actualError, null, "Error should be thrown")
  assert(actualError instanceof Error)

  assertErrorTraceLineMatch(actualError, 0, /\bfoo\b/)
  assertErrorTraceLineMatch(actualError, 0, /\binterpret-block.errors.test\b/)
  assertErrorTraceLineMatch(actualError, 1, /\binterpreted\b/)
  assertErrorTraceLineMatch(actualError, 1, /\bprovided-source.thy:2:1\b/)
  assertErrorTraceLinesMatch(actualError, 2, errorHere, 0)
})

nonWallabyTest(
  "interpretThyBlock() should provide Thy stack trace when error is thrown asynchronously",
  async () => {
    // Make sure async stack traces are homogenous.
    await delay(10)

    const interpreted = interpretThyBlockSource(`f is given\nf\nawait that`, {
      functionName: "interpreted",
      sourceFile: "provided-source.thy",
    })
    async function foo() {
      await delay(10)
      throw new Error("f bad")
    }

    const errorHere = new Error()

    let actualError: unknown = null
    try {
      await interpreted(foo)
    } catch (e) {
      actualError = e
    }

    assert.notStrictEqual(actualError, null, "Error should be thrown")
    assert(actualError instanceof Error)

    assertErrorTraceLineMatch(actualError, 0, /\bfoo\b/)
    assertErrorTraceLineMatch(actualError, 0, /\binterpret-block.errors.test\b/)
    assertErrorTraceLineMatch(actualError, 1, /\binterpreted\b/)
    assertErrorTraceLineMatch(actualError, 1, /\bprovided-source.thy:3:1\b/)
    assertErrorTraceLinesMatch(actualError, 2, errorHere, 0)
  },
)

nonWallabyTest(
  "interpretThyBlock() should provide Thy stack trace when error is thrown synchronously from async code",
  async () => {
    const interpreted = interpretThyBlockSource(`f is given\nf\nawait that`, {
      functionName: "interpreted",
      sourceFile: "provided-source.thy",
    })
    async function foo() {
      throw new Error("f bad")
    }

    // Make sure async stack traces are homogenous.
    await delay(10)

    const errorHere = new Error()

    let actualError: unknown = null
    try {
      await interpreted(foo)
    } catch (e) {
      actualError = e
    }

    assert.notStrictEqual(actualError, null, "Error should be thrown")
    assert(actualError instanceof Error)

    assertErrorTraceLineMatch(actualError, 0, /\bfoo\b/)
    assertErrorTraceLineMatch(actualError, 0, /\binterpret-block.errors.test\b/)
    assertErrorTraceLineMatch(actualError, 1, /\binterpreted\b/)
    assertErrorTraceLineMatch(actualError, 1, /\bprovided-source.thy:3:1\b/)
    assertErrorTraceLinesMatch(actualError, 2, errorHere, 0)
  },
)

nonWallabyTest(
  "interpretThyBlock() should provide Thy stack trace when error is thrown synchronously from async code",
  async () => {
    const interpreted = interpretThyBlockSource(
      `f is given\nf\ng is await that`,
      {
        functionName: "interpreted",
        sourceFile: "provided-source.thy",
      },
    )
    async function foo() {
      throw new Error("f bad")
    }

    // Make sure async stack traces are homogenous.
    await delay(10)

    const errorHere = new Error()

    let actualError: unknown = null
    try {
      await interpreted(foo)
    } catch (e) {
      actualError = e
    }

    assert.notStrictEqual(actualError, null, "Error should be thrown")
    assert(actualError instanceof Error)

    assertErrorTraceLineMatch(actualError, 0, /\bfoo\b/)
    assertErrorTraceLineMatch(actualError, 0, /\binterpret-block.errors.test\b/)
    assertErrorTraceLineMatch(actualError, 1, /\binterpreted\b/)
    assertErrorTraceLineMatch(actualError, 1, /\bprovided-source.thy:3:6\b/)
    assertErrorTraceLinesMatch(actualError, 2, errorHere, 0)
  },
)

test("interpretThyBlock() should properly transform nested Thy Error stack trace", () => {
  const interpreted = interpretThyBlockSource(
    `
ts1 is given
ts2 is given
ts3 is given
thy1 is def
  thy2
thy2 is def
  ts1 thy3
thy3 is def
  ts3
thy1
`,
    {
      functionName: "interpreted",
      sourceFile: "provided-source.thy",
      closure: {
        def: (thing: unknown) => thing,
      },
    },
  )
  function ts1(toCall: () => void) {
    ts2(toCall)
  }
  function ts2(toCall: () => void) {
    toCall()
  }
  function ts3() {
    throw new Error("error from ts3")
  }

  const errorHere = new Error()

  let actualError: unknown = null
  try {
    interpreted(ts1, ts2, ts3)
  } catch (e) {
    actualError = e
  }

  assert.notStrictEqual(actualError, null, "Error should be thrown")
  assert(actualError instanceof Error)

  assertErrorTraceLineMatch(actualError, 0, /\bts3\b/)
  assertErrorTraceLineMatch(actualError, 0, /\binterpret-block.errors.test\b/)
  assertErrorTraceLineMatch(actualError, 1, /\bprovided-source.thy:10:3\b/)
  assertErrorTraceLineMatch(actualError, 2, /\bts2\b/)
  assertErrorTraceLineMatch(actualError, 2, /\binterpret-block.errors.test\b/)
  assertErrorTraceLineMatch(actualError, 3, /\bts1\b/)
  assertErrorTraceLineMatch(actualError, 3, /\binterpret-block.errors.test\b/)
  assertErrorTraceLineMatch(actualError, 4, /\bprovided-source.thy:8:3\b/)
  assertErrorTraceLineMatch(actualError, 5, /\bprovided-source.thy:6:3\b/)
  assertErrorTraceLineMatch(actualError, 6, /\binterpreted\b/)
  assertErrorTraceLineMatch(actualError, 6, /\bprovided-source.thy:11:1\b/)
  assertErrorTraceLinesMatch(actualError, 7, errorHere, 0)

  assert.strictEqual(actualError.message, "error from ts3")
})

test("interpretThyBlock() gracefully handles interpreter errors", () => {
  const interpreted = interpretThyBlockSource(
    `
f is def
  doesNotExist
f
`,
    {
      functionName: "interpreted",
      sourceFile: "provided-source.thy",
      closure: {
        def: (thing: unknown) => thing,
      },
    },
  )

  const errorHere = new Error()

  let actualError: unknown = null
  try {
    interpreted()
  } catch (e) {
    actualError = e
  }

  assert.notStrictEqual(actualError, null, "Error should be thrown")
  assert(actualError instanceof Error)

  assertErrorTraceLineMatch(actualError, 0, /\bprovided-source.thy:3:3\b/)
  assertErrorTraceLineMatch(actualError, 1, /\binterpreted\b/)
  assertErrorTraceLineMatch(actualError, 1, /\bprovided-source.thy:4:1\b/)
  assertErrorTraceLinesMatch(actualError, 2, errorHere, 0)

  assert.strictEqual(actualError.message, "Variable doesNotExist not found")
})

function assertErrorTraceLineMatch(
  error: Error,
  line: number,
  pattern: RegExp,
) {
  const traceLinesString = getErrorTraceLines(error)
  const traceLines = traceLinesString.split("\n")
  assert(
    traceLines.length > line,
    `Error trace should be more than ${line} lines.
<begin full trace>
${traceLinesString}
<end full trace>`,
  )
  assert.match(
    traceLines[line],
    pattern,
    `Error trace line ${line + 1} did not match pattern ${pattern.toString()}
Got: ${JSON.stringify(traceLines[line])}
<begin full trace>
${traceLinesString}
<end full trace>`,
  )
}

function assertErrorTraceLinesMatch(
  actualError: Error,
  actualErrorLineIndex: number,
  expectedError: Error,
  expectedErrorLineIndex: number,
) {
  const traceLinesString = getErrorTraceLines(actualError)
  const traceLines = traceLinesString.split("\n")
  assert(
    traceLines.length > actualErrorLineIndex,
    `Error trace should be more than ${actualErrorLineIndex} lines.
<begin full trace>
${traceLinesString}
<end full trace>`,
  )
  const actualLine = traceLines[actualErrorLineIndex].replace(
    /:\d+:\d+/,
    ":XXX:XXX",
  )

  const expectedTraceLinesString = getErrorTraceLines(expectedError)
  const expectedTraceLines = expectedTraceLinesString.split("\n")
  assert(
    expectedTraceLines.length > expectedErrorLineIndex,
    `Error trace should be more than ${expectedErrorLineIndex} lines. Got:\n${expectedTraceLinesString}\n<end trace>`,
  )
  const expectedLine = expectedTraceLines[expectedErrorLineIndex].replace(
    /:\d+:\d+/,
    ":XXX:XXX",
  )
  assert.strictEqual(
    actualLine,
    expectedLine,
    `Line ${actualErrorLineIndex + 1} of actual error should match line ${expectedErrorLineIndex + 1} of expected error
Actual: ${JSON.stringify(actualLine)}
Expected: ${JSON.stringify(expectedLine)}

Actual full trace:
<begin full trace>
${traceLinesString}
<end full trace>
Expected full trace:
<begin full trace>
${expectedTraceLinesString}
<end full trace>`,
  )
}

test("interpretThyBlock() Thy stack trace counts empty lines and comment lines", () => {
  const interpreted = interpretThyBlockSource(
    `f is given\n\nComment here (empty line above)\nf`,
    {
      functionName: "interpreted",
      sourceFile: "provided-source.thy",
    },
  )
  function foo() {
    throw new Error("f bad")
  }

  const errorHere = new Error()

  let actualError: unknown = null
  try {
    interpreted(foo)
  } catch (e) {
    actualError = e
  }

  assert.notStrictEqual(actualError, null, "Error should be thrown")
  assert(actualError instanceof Error)

  assertErrorTraceLineMatch(actualError, 0, /\bfoo\b/)
  assertErrorTraceLineMatch(actualError, 0, /\binterpret-block.errors.test\b/)
  assertErrorTraceLineMatch(actualError, 1, /\binterpreted\b/)
  assertErrorTraceLineMatch(actualError, 1, /\bprovided-source.thy:4:1\b/)
  assertErrorTraceLinesMatch(actualError, 2, errorHere, 0)
})
