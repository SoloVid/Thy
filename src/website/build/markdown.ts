import { addThyPrismGrammarAndAwaitAvailable } from "editor/prism-grammar"
import { playgroundBaseUrl } from "website/build/links"
import { Marked, Renderer } from "marked"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import Prism from "prismjs"
import "prismjs/components/prism-typescript"
import { rootDir } from "root-dir"
import { generateButton, generateTryButton } from "./button"
import { generateCodeComparison } from "./code-comparison"
import { profileSection } from "./time"
import { makeMarked } from "./marked-renderer"

const marked = makeMarked()
const markedNoTry = makeMarked({ noTry: true })

function preprocessActionButtons(markdown: string): string {
  return markdown
    .replace(/\r/g, "")
    .replace(/\n\n\[([^\[\]]+)\]\(([^\(\)]+)\)\n\n/g, (_, text, url) => {
      return (
        "\n\n" +
        generateButton({
          text: text,
          centered: true,
          href: url,
          newTab: false,
        }) +
        "\n\n"
      )
    })
}

function preprocessComparisons(markdown: string): string {
  return markdown
    .replace(/\r/g, "")
    .replace(
      /```(\w+)\n([\s\S]*?)```\n+vs\.\n+```(\w+)\n([\s\S]*?)```/g,
      (_, language1, source1, language2, source2) => {
        const comparison =
          "\n\n" +
          generateCodeComparison({
            source1,
            language1,
            source2,
            language2,
          }) +
          "\n\n"
        const thySource =
          language1 === "thy" ? source1 : language2 === "thy" ? source2 : null
        if (thySource) {
          const button = generateTryButton({
            playgroundUrl: playgroundBaseUrl,
            source: thySource,
          })
          return comparison + "\n" + button
        }
        return comparison
      },
    )
}

export function renderMarkdownAsHtml(markdown: string, noTry: boolean = false) {
  const titleMatch = /^# (.+)$/m.exec(markdown)
  const title = titleMatch ? titleMatch[1] : "TITLE NOT FOUND"
  const markdownNoTitle = markdown.replace(/^# (.+)$/m, "")
  const preprocessedMarkdown = preprocessComparisons(
    preprocessActionButtons(markdownNoTitle),
  )
  const parser = noTry ? markedNoTry : marked
  const rawHtml = parser.parse(
    preprocessedMarkdown.replace(/\r/g, ""),
  ) as string
  // Marked is inserting weird <p> tags inside my preprocessed code blocks,
  // so I'm removing them here in hacky fashion.
  const html = rawHtml.replace(
    /\n*^<p>( *<span[\s\S]+?)<\/p>$/gm,
    (_, inside) => "\n\n" + inside,
  )
  return {
    title,
    html,
    preprocessedMarkdown,
  }
}

export async function renderMarkdownDocAsHtml(docRelativePath: string) {
  const markdown = await readFile(
    join(rootDir, "docs", docRelativePath),
    "utf-8",
  )
  return renderMarkdownAsHtml(markdown)
}
