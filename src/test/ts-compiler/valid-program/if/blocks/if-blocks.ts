import { tsCoreCompiler } from "../../../../../code-gen/ts-compiler"
import { compileAndVerifyOutput } from "../../compile-valid-program.test.helper"

test("compile if blocks", async () => {
    await compileAndVerifyOutput(tsCoreCompiler, __dirname, "input.thy", "output.ts")
})
