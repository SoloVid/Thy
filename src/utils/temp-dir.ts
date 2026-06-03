import { join } from "node:path"
import { rootDir } from "@/root-dir.ts"
import { randomUUID } from "node:crypto"
import { mkdir, rm } from "node:fs/promises"

export async function withTestTempDir<T>(
  exercise: (dir: string) => PromiseLike<T>,
): Promise<T> {
  const uuid = randomUUID()
  const dirPath = join(rootDir, ".temp", uuid)
  try {
    await mkdir(dirPath)
    return await exercise(dirPath)
  } finally {
    await rm(dirPath, { recursive: true, force: true })
  }
}
