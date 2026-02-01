import { test } from "test-framework"
import {
  compileAndVerifyOutput,
  tsCoreCompiler,
} from "../../compile-valid-program.test.helper.ts"

test("compile if blocks", async () => {
  await compileAndVerifyOutput(
    tsCoreCompiler,
    __dirname,
    "input.thy",
    "output.ts",
  )
})
