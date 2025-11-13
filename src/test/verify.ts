import { compileWorkspaceTs } from "compiler/workspace-ts-compiler"
import { interpretFile } from "node-runtime/interpret-file"
import assert from "node:assert"
import { withTempDir } from "utils/temp-dir"
import { assertDirectoriesMatch } from "./assert-directories-match"

type Options = {
  inputDir: string
  logic: () => unknown
  outputDir: string
  expectedValue: unknown
}

export async function verifyInterpreterAndCompiler(options: Options) {
  assert.strictEqual(options.logic(), options.expectedValue)
  const interpreted = await interpretFile(options.inputDir, "main.thy")
  assert.strictEqual(interpreted, options.expectedValue)

  await withTempDir(async (tempDir) => {
    const results = await compileWorkspaceTs({
      entrypoint: "main.thy",
      inputDirectory: options.inputDir,
      outputDirectory: tempDir,
    })
    // TODO: Check for errors.
    await assertDirectoriesMatch(tempDir, options.outputDir)
  })
}
