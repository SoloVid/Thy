import { readFile } from "node:fs/promises"
import { basename, join } from "node:path"
import { rootDir } from "@/root-dir.ts"
import { collectFiles } from "utils/collect-files.ts"

export async function generateApiIndexMarkdown(directory: string) {
  const inputDir = join(rootDir, "docs", directory)
  const overview = await readFile(join(inputDir, "README.md"), "utf-8")
  const apiFiles = (await collectFiles(inputDir)).filter(
    (f) => !f.endsWith("README.md"),
  )
  const apiFilesContents = await Promise.all(
    apiFiles.map((f) => readFile(join(inputDir, f))),
  )
  const tableOfContents =
    `## On this page\n\n` +
    apiFiles
      .map((f) => {
        const title = basename(f, ".md")
        return `- [${title}](#${title.replaceAll(".", "-")})`
      })
      .join("\n") +
    "\n"
  const linkToTop = `[back to top](#on-this-page)`
  const markdownSections = apiFiles.map((f, i) => {
    const title = basename(f, ".md")
    return `----\n\n## ${title}\n\n${apiFilesContents[i]}\n\n${linkToTop}\n`
  })
  return [overview, tableOfContents, markdownSections.join("\n")].join("\n")
}
