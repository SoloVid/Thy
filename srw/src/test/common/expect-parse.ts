import { expect } from "expect"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { parse } from "../../parse/parse.ts"
import { Block } from "../../tree/block.ts"

export const expectParse = async (
  testDir: string | undefined,
  sourceFile: string,
  expectedParseResult: Block,
) => {
  const source = await readFile(
    join(testDir!, sourceFile),
    "utf-8",
  )
  const actualParseResult = parse(source)
  expect(actualParseResult).toStrictEqual(expectedParseResult)
}
