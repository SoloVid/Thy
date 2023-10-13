import { join } from "node:path"
import { collectFiles } from "../utils/collect-files"

export const rootDir = join(__dirname, "../..")
export const pageInputDir = join(rootDir, "src", "home", "pages")
export const pageOutputDir = join(rootDir, "public")

let pageInputs: readonly string[] | null = null
export async function getPageInputs() {
  return await collectFiles(pageInputDir)
  if (pageInputs === null) {
    pageInputs = await collectFiles(pageInputDir)
  }
  return pageInputs
}
