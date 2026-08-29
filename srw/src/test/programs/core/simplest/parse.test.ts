import { parse } from "@/parse/parse.ts"
import { expect } from "expect"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { test } from "test-framework"
import { TreeNode } from "@/tree/node.ts"
import { Block } from "@/tree/block.ts"

test("core/simplest parser", async () => {
  const source = await readFile(
    join(import.meta.dirname!, "source/main.thy"),
    "utf-8",
  )
  const expectedReturn: Block = {
    type: "block",
    ideas: [
      {
        type: "return",
        func: { type: "return-term" },
        args: [{ type: "number-literal" }],
      },
    ],
  }
  const actualReturn = await parse(source)
  expect(actualReturn).toStrictEqual(expectedReturn)
})
