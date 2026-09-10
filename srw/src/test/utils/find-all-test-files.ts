import { rootDir } from "@/root-dir.ts"
import { walkFiles } from "@/utils/walk-files.ts"
import { join } from "node:path"

export async function findAllTestFiles() {
  const files: string[] = []
  await walkFiles(join(rootDir, "src"), async (f) => {
    if (f.endsWith(".test.ts")) {
      files.push(f)
    }
  })
  return files.sort()
}
