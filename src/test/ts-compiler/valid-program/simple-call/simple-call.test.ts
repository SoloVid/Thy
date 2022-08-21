import { test } from "under-the-sun"
import { tsCoreCompiler } from "../../../../code-gen/ts-compiler"
import { compileAndVerifyOutput } from "../compile-valid-program.test.helper"

test("compile simple call", async () => {
    await compileAndVerifyOutput(tsCoreCompiler, __dirname, "input.thy", "output.ts")
})
