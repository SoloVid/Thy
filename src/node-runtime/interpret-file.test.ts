import assert from "node:assert";
import { test } from "under-the-sun";
import { core } from "../std-lib";
import { interpretFile } from "./interpret-file";
import { testFileB } from "./test-files";

test("interpretFile()", async () => {
  const prints: unknown[][] = []
  const print = (...args: unknown[]) => {
    prints.push(args)
  }
  await interpretFile(testFileB, {
    args: { ...core, print },
  })
  assert.deepStrictEqual(prints, [["Hi from B"]])
})
