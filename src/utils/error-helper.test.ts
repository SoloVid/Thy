import assert from "assert"
import { test } from "under-the-sun"
import { dissectErrorTraceAtBaseline, getErrorTraceLines, getErrorTraceLinesFromStack, replaceErrorTraceLine, transformErrorTrace } from "./error-helper"

test("getErrorTraceLinesFromStack() returns only lines with file and location info (Windows Node 16)", async () => {
  const exampleStackValue = `c:\\Users\\User\\some-file.ts:15
  throw new Error("f bad")
        ^

Error: f bad
    at null.f (c:\\Users\\User\\some-file.ts:15:11)
    at null.anotherLayer (c:\\Users\\User\\anoter\\file.ts:31:10)
    at Object.objectMethod (c:\\Users\\User\\object.ts:82:24)
    at null.<anonymous> (c:\\Users\\User\\lambda.ts:146:44)
    at async w (C:\\Users\\User\\node_modules\\under-the-sun\\lib\\index.js:1:1722)
    at async Object.run (C:\\Users\\User\\node_modules\\under-the-sun\\lib\\index.js:1:1834)`
  const traceLines = getErrorTraceLinesFromStack(exampleStackValue)

  assert.strictEqual(traceLines, `    at null.f (c:\\Users\\User\\some-file.ts:15:11)
    at null.anotherLayer (c:\\Users\\User\\anoter\\file.ts:31:10)
    at Object.objectMethod (c:\\Users\\User\\object.ts:82:24)
    at null.<anonymous> (c:\\Users\\User\\lambda.ts:146:44)
    at async w (C:\\Users\\User\\node_modules\\under-the-sun\\lib\\index.js:1:1722)
    at async Object.run (C:\\Users\\User\\node_modules\\under-the-sun\\lib\\index.js:1:1834)`)
})

test("getErrorTraceLinesFromStack() returns only lines with file and location info (Firefox)", async () => {
  const exampleStackValue = `f@file:///C:/Users/User/code/thy/test.html:4:9
go@file:///C:/Users/User/code/thy/test.html:8:3
@file:///C:/Users/User/code/thy/test.html:12:3`
  const traceLines = getErrorTraceLinesFromStack(exampleStackValue)
  assert.strictEqual(traceLines, exampleStackValue)
})

class FakeError extends Error {
  constructor(
    public readonly message: string,
    public readonly stack: string,
  ) {
    super(message)
  }
}

test("getErrorTraceLines() returns only lines with file and location info (Windows Node 16)", async () => {
  const error = new FakeError("oh noes", `c:\\Users\\User\\some-file.ts:15
  throw new Error("oh noes")
        ^

Error: oh noes
    at null.f (c:\\Users\\User\\some-file.ts:15:11)
    at async Object.run (C:\\Users\\User\\node_modules\\under-the-sun\\lib\\index.js:1:1834)`)
  const traceLines = getErrorTraceLines(error)
  assert.strictEqual(traceLines, `    at null.f (c:\\Users\\User\\some-file.ts:15:11)
    at async Object.run (C:\\Users\\User\\node_modules\\under-the-sun\\lib\\index.js:1:1834)`)
})

test("getErrorTraceLines() can filter trace-looking info from Error message", async () => {
  const error = new FakeError(`    at null.f (c:\\Users\\User\\some-file.ts:15:11)
    at async Object.run (C:\\Users\\User\\node_modules\\under-the-sun\\lib\\index.js:1:1834)
`, `c:\\Users\\User\\some-file.ts:15
  throw new Error(\`    at null.f (c:\\Users\\User\\some-file.ts:15:11)
        ^

Error:     at null.f (c:\\Users\\User\\some-file.ts:15:11)
    at async Object.run (C:\\Users\\User\\node_modules\\under-the-sun\\lib\\index.js:1:1834)

    at null.f (c:\\Users\\User\\some-file.ts:15:11)
    at async Object.run (C:\\Users\\User\\node_modules\\under-the-sun\\lib\\index.js:1:1834)`)
  const traceLines = getErrorTraceLines(error)
  assert.strictEqual(traceLines, `    at null.f (c:\\Users\\User\\some-file.ts:15:11)
    at async Object.run (C:\\Users\\User\\node_modules\\under-the-sun\\lib\\index.js:1:1834)`)
})

test("transformErrorTrace() allows transforming an Error's trace", async () => {
  const originalError = new FakeError("oh noes", `c:\\Users\\User\\some-file.ts:15
  throw new Error("oh noes")
        ^

Error: oh noes
    at null.f (c:\\Users\\User\\some-file.ts:15:11)
    at async Object.run (C:\\Users\\User\\node_modules\\under-the-sun\\lib\\index.js:1:1834)`)
  const transformedError = transformErrorTrace(originalError, (originalTraceLines) => "altered trace lines")
  assert.strictEqual(transformedError.stack, `c:\\Users\\User\\some-file.ts:15
  throw new Error("oh noes")
        ^

Error: oh noes
altered trace lines`)
})

test("dissectErrorTraceAtBaseline() splits the trace lines beyond the baseline", async () => {
  const innerError = new FakeError("oh noes", `c:\\Users\\User\\some-file.ts:15
  throw new Error("oh noes")
        ^

Error: oh noes
    at null.f (c:\\Users\\User\\some-file.ts:15:11)
    at null.anotherLayer (c:\\Users\\User\\anoter\\file.ts:31:10)
    at Object.objectMethod (c:\\Users\\User\\object.ts:82:24)
    at null.<anonymous> (c:\\Users\\User\\lambda.ts:146:44)
    at async w (C:\\Users\\User\\node_modules\\under-the-sun\\lib\\index.js:1:1722)
    at async Object.run (C:\\Users\\User\\node_modules\\under-the-sun\\lib\\index.js:1:1834)`)
  const baselineError = new FakeError("baseline", `c:\\Users\\User\\some-file.ts:15
  throw new Error("baseline")
        ^

Error: baseline
    at null.<anonymous> (c:\\Users\\User\\lambda.ts:145:10)
    at async w (C:\\Users\\User\\node_modules\\under-the-sun\\lib\\index.js:1:1722)
    at async Object.run (C:\\Users\\User\\node_modules\\under-the-sun\\lib\\index.js:1:1834)`)
  
  const innerErrorTraceLines = getErrorTraceLines(innerError).split("\n")
  const baselineErrorTraceLines = getErrorTraceLines(baselineError).split("\n")
  assert.strictEqual(innerErrorTraceLines[4], baselineErrorTraceLines[1])
  assert.strictEqual(innerErrorTraceLines[3].replace("146:44", ""), baselineErrorTraceLines[0].replace("145:10", ""))

  const dissectedTraceLines = dissectErrorTraceAtBaseline(innerError, baselineError)
  assert.strictEqual(dissectedTraceLines.delta, `    at null.f (c:\\Users\\User\\some-file.ts:15:11)
    at null.anotherLayer (c:\\Users\\User\\anoter\\file.ts:31:10)
    at Object.objectMethod (c:\\Users\\User\\object.ts:82:24)`)
  assert.strictEqual(dissectedTraceLines.pivot, `    at null.<anonymous> (c:\\Users\\User\\lambda.ts:146:44)`)
  assert.strictEqual(dissectedTraceLines.shared, `    at async w (C:\\Users\\User\\node_modules\\under-the-sun\\lib\\index.js:1:1722)
    at async Object.run (C:\\Users\\User\\node_modules\\under-the-sun\\lib\\index.js:1:1834)`)
})

test("replaceErrorTraceLine() allows swapping trace line file and location (Windows Node 16)", async () => {
  const inputLines = `    at null.f (c:\\Users\\User\\some-file.ts:15:11)
    at null.anotherLayer (c:\\Users\\User\\anoter\\file.ts:31:10)
    at async Object.run (C:\\Users\\User\\node_modules\\under-the-sun\\lib\\index.js:1:1834)`
  const outputLines = replaceErrorTraceLine(inputLines, 1, (file, row, column) => {
    assert.strictEqual(file, "c:\\Users\\User\\anoter\\file.ts")
    assert.strictEqual(row, 31)
    assert.strictEqual(column, 10)
    return ["test-replace-file", 12, 34]
  })
  assert.strictEqual(outputLines, `    at null.f (c:\\Users\\User\\some-file.ts:15:11)
    at null.anotherLayer (test-replace-file:12:34)
    at async Object.run (C:\\Users\\User\\node_modules\\under-the-sun\\lib\\index.js:1:1834)`)
})

test("replaceErrorTraceLine() allows swapping trace line file and location (Firefox)", async () => {
  const inputLines = `f@file:///C:/Users/User/code/thy/test.html:4:9
go@file:///C:/Users/User/code/thy/test.html:8:3
@file:///C:/Users/User/code/thy/test.html:12:3`
  const outputLines = replaceErrorTraceLine(inputLines, 1, (file, row, column) => {
    assert.strictEqual(file, "file:///C:/Users/User/code/thy/test.html")
    assert.strictEqual(row, 8)
    assert.strictEqual(column, 3)
    return ["test-replace-file", 12, 34]
  })
  assert.strictEqual(outputLines, `f@file:///C:/Users/User/code/thy/test.html:4:9
go@test-replace-file:12:34
@file:///C:/Users/User/code/thy/test.html:12:3`)
})
