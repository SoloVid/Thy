import { compileWorkspaceTs } from "compiler/workspace-ts-compiler.ts"
import { interpretFile } from "node-runtime/interpret-file.ts"
import assert from "node:assert"
import { withTestTempDir } from "utils/temp-dir.ts"
import { assertDirectoriesMatch } from "./assert-directories-match.ts"

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

  await withTestTempDir(async (tempDir) => {
    const results = await compileWorkspaceTs({
      entrypoint: "main.thy",
      inputDirectory: options.inputDir,
      outputDirectory: tempDir,
    })
    // TODO: Check for errors.
    await assertDirectoriesMatch(tempDir, options.outputDir)
  })
}
