import { walkFiles } from "./walk-files.ts"

export async function collectFiles(directory: string) {
  const files: string[] = []
  await walkFiles(
    {
      rootDir: directory,
    },
    async (f) => {
      files.push(f)
    },
  )
  return files
}
