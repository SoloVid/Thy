import { interpretThyWorkspace } from "interpreter/workspace"
import assert from "node:assert"
import { join } from "node:path"
import { core } from "std-lib/core"
import { test } from "test-framework"
import { makeNodeFileBrowser } from "utils/fs/node-fs-file-browse"

export async function interpretFile(root: string, entrypoint: string) {
  const fileBrowser = makeNodeFileBrowser(root)
  const result = await interpretThyWorkspace(fileBrowser, entrypoint, core)
  return result
}
