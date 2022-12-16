import assert from "node:assert"
import { test } from "under-the-sun"
import { interpretThyMultilineString } from "./string"
import type { MultilineString } from "./types"

test("interpretThyMultilineString() should return string with stripped insignificant whitespace", async () => {
  const input: MultilineString = {
    type: "multiline-string",
    indent: "    ",
    lines: [
      "",
      "  ",
      "    ",
      "     ",
      "    something",
      "",
      "     ",
      "    ",
      "",
    ]
  }
  const output = interpretThyMultilineString(input)
  assert.strictEqual(output, `\n\n\n \nsomething\n\n `)
})
