import assert from "node:assert"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { collectFiles } from "utils/collect-files"

export async function assertDirectoriesMatch(actualDirectory: string, expectedDirectory: string) {
  const actualFiles = await collectFiles(actualDirectory)
  const expectedFiles = await collectFiles(expectedDirectory)
  assert.deepStrictEqual(
    actualFiles,
    expectedFiles,
    "Directory listings should match"
  )
  for (const file of actualFiles) {
    const actualFileContent = (await readFile(join(actualDirectory, file), "utf-8")).replaceAll("\r", "")
    const expectedFileContent = (await readFile(join(expectedDirectory, file), "utf-8")).replaceAll("\r", "")
    assert.strictEqual(actualFileContent, expectedFileContent, `${file} should match expected content`)
  }
}
