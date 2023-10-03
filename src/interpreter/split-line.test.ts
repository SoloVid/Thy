import assert from "node:assert"
import { test } from "under-the-sun"
import { splitLineParts } from "./split-line"

function splitLinePartsJustStrings(...args: Parameters<typeof splitLineParts>): readonly string[] {
  return splitLineParts(...args).map(p => p.text)
}

test("splitLineParts() should split a line by spaces", async () => {
  assert.deepStrictEqual(splitLinePartsJustStrings(`a b c`), [`a`, `b`, `c`])
})

test("splitLineParts() should split line into parts of complex formats", async () => {
  assert.deepStrictEqual(splitLinePartsJustStrings(`a.b.c -148.0 "himom"`), [`a.b.c`, `-148.0`, `"himom"`])
})

test("splitLineParts() should not split a string with spaces", async () => {
  assert.deepStrictEqual(splitLinePartsJustStrings(`f "hi mom"`), [`f`, `"hi mom"`])
})

test("splitLineParts() should leave multiline string opener intact", async () => {
  assert.deepStrictEqual(splitLinePartsJustStrings(`f """`), [`f`, `"""`])
})

test("splitLineParts() should discard types", async () => {
  assert.deepStrictEqual(splitLinePartsJustStrings(`foo A String MyType a b c`), [`foo`, `a`, `b`, `c`])
})

test("splitLineParts() should return token index information", async () => {
  assert.deepStrictEqual(splitLineParts(`  a.b.c -148.0 "himom" d`), [
    { text: `a.b.c`, index: 2 }, 
    { text: `-148.0`, index: 8 },
    { text: `"himom"`, index: 15 },
    { text: `d`, index: 23 },
  ])
})
