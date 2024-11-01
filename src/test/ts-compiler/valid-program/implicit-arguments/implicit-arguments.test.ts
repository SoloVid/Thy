import { tsCoreCompiler } from "code-gen/ts/ts-compiler"
import { test } from "test-framework"
import { compileAndVerifyOutput } from "../compile-valid-program.test.helper"

test("implicit arguments", async () => {
  await compileAndVerifyOutput(
    tsCoreCompiler,
    __dirname,
    "input.thy",
    "output.ts",
  )
})
