import { mkdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { rootDir } from "@/root-dir.ts"
import { walkFiles } from "utils/walk-files.ts"
import { generateApiIndexMarkdown } from "./api-index.ts"
import { renderMarkdownAsHtml, renderMarkdownDocAsHtml } from "./markdown.ts"
import { getTemplateHtml } from "./template.ts"
import { profileSection } from "./time.ts"

const pageOutputDir = join(rootDir, "out/website")

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
    .replaceAll("$PAGE_TITLE", pageTitle)
    .replace("$BODY_HTML", bodyHtml)
}

export async function generateHtmlAll() {
  const inputDir = join(rootDir, "docs")
  await walkFiles(
    {
      rootDir: inputDir,
    },
    async (relativePath) =>
      profileSection(relativePath, async () => {
        console.log(`Generating HTML for ${relativePath}`)
        const { title, html, preprocessedMarkdown } =
          await renderMarkdownDocAsHtml(relativePath)
        await generateHtml(
          relativePath
            .replace(/\bREADME\.md$/, "index.md")
            .replace(/\.md$/, ".html"),
          title,
          `<div class="column-content-md">${html}</div>`,
        )
      }),
  )
}

export async function generateApiReference(inputDir: string) {
  await profileSection(inputDir, async () => {
    console.log(`Generating HTML for API reference ${inputDir}`)
    const indexMarkdown = await generateApiIndexMarkdown(inputDir)

    const { title, html, preprocessedMarkdown } = renderMarkdownAsHtml(
      indexMarkdown,
      true,
    )
    await generateHtml(
      `${inputDir}/index.html`,
      title,
      `<div class="column-content-md">${html}</div>`,
    )
  })
}
