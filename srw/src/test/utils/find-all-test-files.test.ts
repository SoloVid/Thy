import { test } from "test-framework"
import { findAllTestFiles } from "./find-all-test-files.ts"
import { expect } from "expect"

test("findAllTestFiles() generates valid list", async () => {
  const testFiles = await findAllTestFiles()
  expect(testFiles).toContain("golden.test.ts")
  expect(testFiles).toContain("test/utils/find-all-test-files.test.ts")
})
