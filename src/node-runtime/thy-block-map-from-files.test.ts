import assert from "node:assert"
import { defineTestGroup } from "under-the-sun"
import { testFileA, testFileB, testFileBar, testFileBaz } from "./test-files"
import { makeThyBlockMapFromFiles } from "./thy-block-map-from-files"

const testMakeThyBlockMap = defineTestGroup("makeThyBlockMapFromFiles() ")

testMakeThyBlockMap("should construct block map from files", async () => {
  const blockMap = await makeThyBlockMapFromFiles([testFileA, testFileB, testFileBar, testFileBaz])
  assert.deepStrictEqual(blockMap, {
    a: testFileA,
    b: testFileB,
    bar: testFileBar,
    baz: testFileBaz,
  })
})
