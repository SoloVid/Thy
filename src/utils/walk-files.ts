import { readdir } from "node:fs/promises"
import path from "node:path"

export type WalkOptions = {
  rootDir: string
  dir?: string
  ignorePattern?: RegExp
}

export async function walkFiles(
  { rootDir, dir, ignorePattern }: WalkOptions,
  handler: (filePath: string) => PromiseLike<void>,
) {
  return walkFilesRequired(
    {
      rootDir,
      dir: dir ?? "",
      ignorePattern: ignorePattern ?? /NOMATCH/,
    },
    handler,
  )
}

async function walkFilesRequired(
  { rootDir, dir, ignorePattern }: Required<WalkOptions>,
  handler: (filePath: string) => PromiseLike<void>,
) {
  const listing = await readdir(path.join(rootDir, dir), {
    withFileTypes: true,
  })
  const tighterListing = listing
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((e) => ({
      isDir: e.isDirectory(),
      path: path.posix.join(dir, e.name),
    }))
    .filter((e) => !ignorePattern.test(e.path))
  await Promise.all([
    ...tighterListing
      .filter((e) => !e.isDir)
      .map((leafFile) => handler(leafFile.path)),
    ...tighterListing
      .filter((e) => e.isDir)
      .map((directory) =>
        walkFiles({ rootDir, dir: directory.path, ignorePattern }, handler)
      ),
  ])
}
