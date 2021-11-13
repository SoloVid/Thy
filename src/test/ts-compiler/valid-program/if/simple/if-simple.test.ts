import { compileAndVerifyOutput } from "../../compile-valid-program.test.helper"

test("compile simple if", async () => {
    await compileAndVerifyOutput(__dirname, "input.thy", "output.ts")
})
