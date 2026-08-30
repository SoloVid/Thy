import { parse } from "@/parse/parse.ts"
import { expect } from "expect"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { test } from "test-framework"
import { TreeNode } from "@/tree/node.ts"
import { Block } from "@/tree/block.ts"
import { lex } from "@/lex/lex.ts"
import { LexResult } from "@/lex/generic/result.ts"
import { tNumber, tReturn } from "@/lex/token-kind.ts"

test("core/simplest lex", async () => {
  const source = await readFile(
    join(import.meta.dirname!, "source/main.thy"),
    "utf-8",
  )
  const expectedReturn: LexResult = {
    tokens: [
      {
        kind: tReturn,
        position: 0,
        length: 6,
      },
      {
        kind: tNumber,
        position: 7,
        length: 1,
      }
    ]
  }
  const actualReturn = lex(source)
  expect(actualReturn).toStrictEqual(expectedReturn)
})
