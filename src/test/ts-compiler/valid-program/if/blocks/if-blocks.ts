import {
  compileAndVerifyOutput,
  tsCoreCompiler,
} from "../../compile-valid-program.test.helper"

test("compile if blocks", async () => {
  await compileAndVerifyOutput(
    tsCoreCompiler,
    __dirname,
    "input.thy",
    "output.ts",
  )
})
