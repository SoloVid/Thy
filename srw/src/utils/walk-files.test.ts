import { rootDir } from "@/root-dir.ts"
import { expect } from "expect"
import { test } from "test-framework"
import { walkFiles } from "./walk-files.ts"

test("walkFiles() can navigate source files", async () => {
  const filesFound: string[] = []
  await walkFiles(rootDir, async (f) => {
    filesFound.push(f)
  })
  expect(filesFound).toContain("src/utils/walk-files.ts")
})
