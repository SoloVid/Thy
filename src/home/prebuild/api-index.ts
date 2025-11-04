import { readFile } from "node:fs/promises"
import { basename, join } from "node:path"
import { rootDir } from "root-dir"
import { collectFiles } from "utils/collect-files"

export async function generateApiIndexMarkdown(directory: string) {
  const inputDir = join(rootDir, "docs", directory)
  const apiFiles = await collectFiles(inputDir)
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
  const combinedMarkdown = tableOfContents + "\n" + markdownSections.join("\n")
  return combinedMarkdown
}
