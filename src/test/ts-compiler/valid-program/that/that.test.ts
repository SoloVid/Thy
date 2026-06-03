import { test } from "test-framework"
import {
  compileAndVerifyOutput,
  tsCoreCompiler,
} from "../compile-valid-program.test.helper.ts"

test("compile that", async () => {
  await compileAndVerifyOutput(
    tsCoreCompiler,
    import.meta.dirname!,
    "input.thy",
    "output.ts",
  )
})
