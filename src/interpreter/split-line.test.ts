import assert from "node:assert"
import { test } from "under-the-sun"
import { splitLineParts } from "./split-line"

test("splitLineParts() should split a line by spaces", async () => {
  assert.deepStrictEqual(splitLineParts(`a b c`), [`a`, `b`, `c`])
})

test("splitLineParts() should split line into parts of complex formats", async () => {
  assert.deepStrictEqual(splitLineParts(`a.b.c -148.0 "himom"`), [`a.b.c`, `-148.0`, `"himom"`])
})

test("splitLineParts() should not split a string with spaces", async () => {
  assert.deepStrictEqual(splitLineParts(`f "hi mom"`), [`f`, `"hi mom"`])
})
