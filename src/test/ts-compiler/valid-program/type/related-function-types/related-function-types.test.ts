import { test } from "test-framework"
import {
  compileAndVerifyOutput,
  tsCoreCompiler,
} from "../../compile-valid-program.test.helper.ts"

test("compile related function types", async () => {
  await compileAndVerifyOutput(
    tsCoreCompiler,
    import.meta.dirname!,
    "input.thy",
    "output.ts",
  )
})
