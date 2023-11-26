import { walkFiles } from "./walk-files"

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
