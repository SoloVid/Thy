import assert from "node:assert"
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { FileBrowseApi } from "./file-browse-api.ts"

// From https://stackoverflow.com/a/45242825/4639640
function isPathInside(rootDirectory: string, otherPath: string) {
  const relative = path.relative(rootDirectory, otherPath)
  return !relative.startsWith("..") && !path.isAbsolute(relative)
}

function assertPathInside(rootDirectory: string, relativePath: string) {
  assert(
    isPathInside(rootDirectory, path.join(rootDirectory, relativePath)),
    `${relativePath} is not inside directory ${rootDirectory}`,
  )
}

export function makeNodeFileBrowser(rootDirectory: string): FileBrowseApi {
  return {
    read(relativePath) {
      assertPathInside(rootDirectory, relativePath)
      return readFile(path.join(rootDirectory, relativePath), "utf-8")
    },
    async list(relativePath) {
      assertPathInside(rootDirectory, relativePath)
      const listing = await readdir(path.join(rootDirectory, relativePath), {
        withFileTypes: true,
      })
      return listing.map((e) => ({
        isDirectory: e.isDirectory(),
        name: e.name,
      }))
    },
  }
}
