import { readdir } from "node:fs/promises"
import { join } from "node:path/posix"

type Handler = (filePath: string) => PromiseLike<void>

export function walkFiles(rootDir: string, handler: Handler) {
  return walkFilesInnards({ rootDir }, handler)
}

type WalkOptions = {
  rootDir: string
  dir?: string
}

async function walkFilesInnards(
  { rootDir, dir }: WalkOptions,
  handler: Handler,
) {
  return walkFilesRequired(
    {
      rootDir,
      dir: dir ?? "",
    },
    handler,
  )
}

async function walkFilesRequired(
  { rootDir, dir }: Required<WalkOptions>,
  handler: (filePath: string) => PromiseLike<void>,
) {
  const listing = await readdir(join(rootDir, dir), {
    withFileTypes: true,
  })
  await Promise.all(
    listing
      .sort((a, b) => a.name.localeCompare(b.name)).map((e) => {
        const ePath = join(dir, e.name)
        if (e.isDirectory()) {
          return walkFilesInnards({ rootDir, dir: ePath }, handler)
        } else {
          return handler(ePath)
        }
      }),
  )
}
