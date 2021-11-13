import { compileAndVerifyOutput } from "../compile-valid-program.test.helper"

test("compile that", async () => {
    await compileAndVerifyOutput(__dirname, "input.thy", "output.ts")
})
