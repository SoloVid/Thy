import { compileAndVerifyOutput } from "../../compile-valid-program.test.helper"

test("compile if blocks", async () => {
    await compileAndVerifyOutput(__dirname, "input.thy", "output.ts")
})
