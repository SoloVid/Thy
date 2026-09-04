import { expect } from "expect"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { LexResult } from "../../lex/generic/result.ts"
import { lex } from "../../lex/lex.ts"

export const expectLex = async (
  testDir: string | undefined,
  sourceFile: string,
  expectedLexResult: LexResult,
) => {
  const source = await readFile(
    join(testDir!, sourceFile),
    "utf-8",
  )
  const actualLexResult = lex(source)
  expect(actualLexResult).toStrictEqual(expectedLexResult)
}
