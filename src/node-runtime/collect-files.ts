import { readdir } from "node:fs/promises"
import path from "node:path"

export async function collectFiles(directory: string) {
  const files: string[] = []
  await walkFiles({
    rootDir: directory,
    dir: "",
    ignorePattern: /TODO/,
  }, async (f) => {
    files.push(f)
  })
  return files
}

type WalkOptions = {
  rootDir: string
  dir: string
  ignorePattern: RegExp
}

export async function walkFiles(
  { rootDir, dir, ignorePattern }: WalkOptions,
  handler: (filePath: string) => PromiseLike<void>
) {
  const listing = await readdir(path.join(rootDir, dir), { withFileTypes: true })
  const tighterListing = listing
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(e => ({
      isDir: e.isDirectory(),
      path: path.posix.join(dir, e.name),
    }))
    .filter(e => !ignorePattern.test(e.path))
  for (const leafFile of tighterListing.filter(e => !e.isDir)) {
    await handler(leafFile.path)
  }
  for (const directory of tighterListing.filter(e => e.isDir)) {
    await walkFiles({ rootDir, dir: directory.path, ignorePattern }, handler)
  }
}
