import { compileWorkspaceTs } from "compiler/workspace-ts-compiler.ts"
import { interpretFile } from "node-runtime/interpret-file.ts"
import assert from "node:assert"
import { join } from "node:path"
import { test } from "test-framework"
import { assertDirectoriesMatch } from "test/assert-directories-match.ts"
import { withTestTempDir } from "utils/temp-dir.ts"

const inputDirectory = join(import.meta.dirname!, "input")
const expectedOutputDirectory = join(import.meta.dirname!, "output")

test("interpretFile() should process inter-file dependencies", async () => {
  const interpreted = await interpretFile(inputDirectory, "main.thy")
  assert.strictEqual(interpreted, 5)
})

test("compileWorkspaceTs() should process inter-file dependencies", async () => {
  await withTestTempDir(async (tempDir) => {
    const results = await compileWorkspaceTs({
      entrypoint: "main.thy",
      inputDirectory: inputDirectory,
      outputDirectory: tempDir,
    })
    // TODO: Check for errors.
    await assertDirectoriesMatch(tempDir, expectedOutputDirectory)
  })
})
