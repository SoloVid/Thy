import { test } from "under-the-sun"
import { tsNamespaceCompiler } from "../../../../code-gen/ts-compiler"
import { compileAndVerifyOutput } from "../compile-valid-program.test.helper"

test("compile namespace declaration", async () => {
    await compileAndVerifyOutput(tsNamespaceCompiler, __dirname, "a.thy", "a.ts")
})

test("compile namespace import", async () => {
    await compileAndVerifyOutput(tsNamespaceCompiler, __dirname, "b.thy", "b.ts")
})
