import { mkdir, writeFile } from "node:fs/promises"
import { dirname, join, relative } from "node:path"
import { rootDir } from "root-dir"
import { getTemplateHtml } from "./template"
import { walkFiles } from "utils/walk-files"
import { renderMarkdownDocAsHtml } from "./markdown"
import { profileSection } from "./time"

const pageOutputDir = join(rootDir, "public")

export async function generateHtml(
  outputFile: string,
  pageTitle: string,
  bodyHtml: string,
) {
  const targetPath = join(pageOutputDir, outputFile)
  await mkdir(dirname(targetPath), { recursive: true })
  const html = await makeHtml(pageTitle, bodyHtml)
  await writeFile(targetPath, html)
}

async function makeHtml(pageTitle: string, bodyHtml: string) {
  const templateHtml = await getTemplateHtml()
  return templateHtml
    .replace("$PAGE_TITLE", pageTitle)
    .replace("$BODY_HTML", bodyHtml)
}

export async function generateHtmlAll() {
  const inputDir = join(rootDir, "docs")
  await walkFiles(
    {
      rootDir: inputDir,
      dir: "",
      ignorePattern: /TODO/,
    },
    async (f) =>
      profileSection(f, async () => {
        const relativePath = f //relative(inputDir, f)
        console.log(`Generating HTML for ${relativePath}`)
        const { title, html, preprocessedMarkdown } =
          await renderMarkdownDocAsHtml(relativePath)
        await generateHtml(
          relativePath.replace(/\.md$/, ".html"),
          title,
          `<div class="column-content-md">${html}</div>`,
        )
        // throw new Error("early stop")
      }),
  )
}
