import assert from "node:assert"
import { test } from "under-the-sun"
import { extractIndent, getFirstIndent } from "./indentation"

test("extractIndent() should return line indent characters", async () => {
  assert.strictEqual(extractIndent(`    a`), "    ")
})

test("extractIndent() should return empty string for no indent", async () => {
  assert.strictEqual(extractIndent(`a`), "")
})

test("getFirstIndent() should return indent of single line", async () => {
  assert.strictEqual(getFirstIndent([`    a`]), "    ")
})

test("getFirstIndent() should skip empty lines", async () => {
  assert.strictEqual(getFirstIndent([
    ``,
    `    `,
    `  a`,
  ]), "  ")
})

test("getFirstIndent() should return empty string if there are no non-empty lines", async () => {
  assert.strictEqual(getFirstIndent([
    `  `,
    ``,
    `    `,
  ]), "")
})
