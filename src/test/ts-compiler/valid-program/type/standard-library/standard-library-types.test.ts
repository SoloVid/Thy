import { test } from "under-the-sun"
import { tsCoreCompiler } from "../../../../../code-gen/ts-compiler"
import { compileAndVerifyOutput } from "../../compile-valid-program.test.helper"

test("compile standard library types", async () => {
    await compileAndVerifyOutput(tsCoreCompiler, __dirname, "input.thy", "output.ts")
})
