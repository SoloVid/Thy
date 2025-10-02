import assert from "node:assert"
import { test } from "test-framework"
import { core } from "std-lib/core"
import { interpretThyBlockSource, interpretThyWorkspace } from "interpreter/block"
import { FileBrowseApi } from "utils/fs/file-browse-api"
import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"

function makeFileBrowser(root: string): FileBrowseApi {
  return {
    read(path) {
      return readFile(join(root, path), "utf-8")
    },
    async list(path) {
      const nodeResult = await readdir(join(root, path), { withFileTypes: true })
      return nodeResult.map(e => ({ name: e.name, isDirectory: e.isDirectory() }))
    },
  }
}

async function interpretFile(root: string, entrypoint: string) {
  const fileBrowser = makeFileBrowser(root)
  const result = await interpretThyWorkspace(fileBrowser, entrypoint, {
    closure: core
  })
  return result
}

test("interpretThyBlock() should return a function that can return a number", async () => {
  const interpreted = await interpretFile(join(__dirname, "input"), "main.thy")
  assert.strictEqual(interpreted, 5)
})
