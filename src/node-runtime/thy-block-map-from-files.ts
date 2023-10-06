import { readFile } from "node:fs/promises"
import { interpretThyBlockWithMeta } from "../interpreter/block"
import { saferPromiseAll } from "../utils/safer-promise-all"

export async function makeThyBlockMapFromFiles(files: readonly string[]): Promise<Record<string, string>> {
  const exportsList = await saferPromiseAll(files.map(async (f) => {
    const contents = await readFile(f, "utf-8")
    const { returns } = interpretThyBlockWithMeta(contents)
    return returns.style === "exports" ? returns.exports.reduce((soFar, field) => ({
      ...soFar,
      [field]: f,
    }), {}) : {}
  }))
  return exportsList.reduce((soFar, fileResult) => {
    return {
      ...soFar,
      ...fileResult,
    }
  }, {} as Record<string, string>)
}
