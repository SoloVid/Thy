import fs from "node:fs/promises"
import { join } from "node:path"

export async function readProgram(fileName: string) {
  const buffer = await fs.readFile(join(import.meta.dirname!, "..", fileName))
  return buffer.toString()
}
