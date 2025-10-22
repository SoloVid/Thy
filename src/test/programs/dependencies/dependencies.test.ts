import { compileWorkspaceTs } from "compiler/workspace-ts-compiler"
import { interpretFile } from "node-runtime/interpret-file"
import assert from "node:assert"
import { join } from "node:path"
import { test } from "test-framework"
import { assertDirectoriesMatch } from "test/assert-directories-match"
import { withTempDir } from "utils/temp-dir"

const inputDirectory = join(__dirname, "input")
const expectedOutputDirectory = join(__dirname, "output")

test("interpretFile() should process inter-file dependencies", async () => {
  const interpreted = await interpretFile(inputDirectory, "main.thy")
  assert.strictEqual(interpreted, 5)
})

test("compileWorkspaceTs() should process inter-file dependencies", async () => {
  await withTempDir(async (tempDir) => {
    const results = await compileWorkspaceTs({
      entrypoint: "main.thy",
      inputDirectory: inputDirectory,
      outputDirectory: tempDir,
    })
    // TODO: Check for errors.
    await assertDirectoriesMatch(tempDir, expectedOutputDirectory)
  })
})
