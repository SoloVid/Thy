import { interpret } from "@/interpret/interpret.ts"
import { expect } from "expect"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { test } from "test-framework"

test("core/simplest interpreter", async () => {
  const source = await readFile(
    join(import.meta.dirname!, "source/main.thy"),
    "utf-8",
  )
  const expectedReturn = JSON.parse(
    await readFile(join(import.meta.dirname!, "return.json"), "utf-8"),
  )
  const actualReturn = await interpret(source)
  expect(actualReturn).toStrictEqual(expectedReturn)
})
