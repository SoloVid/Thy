import { interpretThyWorkspace } from "@/interpreter/workspace.ts"
import assert from "node:assert"
import { join } from "node:path"
import { core } from "std-lib/core/index.ts"
import { test } from "test-framework"
import { makeNodeFileBrowser } from "utils/fs/node-fs-file-browse.ts"

export async function interpretFile(root: string, entrypoint: string) {
  const fileBrowser = makeNodeFileBrowser(root)
  const result = await interpretThyWorkspace(fileBrowser, entrypoint, core)
  return result
}
