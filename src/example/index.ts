import { readFile } from "node:fs/promises"
import { join } from "node:path"

export async function readExampleFile(file: string) {
  return readFile(join(__dirname, file), "utf-8")
}
