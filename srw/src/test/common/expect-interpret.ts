import { expect } from "expect"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { interpret } from "../../interpret/interpret.ts"

export const expectInterpret = async (
  testDir: string | undefined,
  sourceFile: string,
  expectedReturnJsonFile: string,
) => {
  const source = await readFile(
    join(testDir!, sourceFile),
    "utf-8",
  )
  const expectedReturn = JSON.parse(
    await readFile(join(testDir!, expectedReturnJsonFile), "utf-8"),
  )
  const actualReturn = await interpret(source)
  expect(actualReturn).toStrictEqual(expectedReturn)
}
