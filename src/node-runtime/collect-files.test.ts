import assert from "node:assert"
import { test } from "under-the-sun"
import { collectFiles } from "./collect-files"
import { testFileDir } from "./test-files"

test("collectFiles() should return recursive list of files, sorted by depth", async () => {
  const files = await collectFiles(testFileDir)
  assert.deepStrictEqual(files, [
    "a.thy",
    "b.thy",
    "my/baz.thy",
    "my/foo/bar.thy",
  ])
})
