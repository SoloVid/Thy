import { playgroundBaseUrl } from "../../../links"
import { generateApiIndexMarkdown } from "../../api-index"
import { generateHtml } from "../../helper"
import { renderMarkdownAsHtml } from "../../markdown"

export default async () => {
  const indexMarkdown = await generateApiIndexMarkdown("std-lib/playground")
  const markdown = `# Playground Standard Library

## Overview

In addition to the Core Standard Library,
the [Thy Playground](${playgroundBaseUrl})
also provides a set of functions and values specific to that environment.
Where appropriate, links are provided to equivalent JavaScript functionality
for further reading.

${indexMarkdown}
`
  await generateHtml(
    "std-lib/playground/index.html",
    "Playground Standard Library",
    `<div class="column-content-md">` +
      renderMarkdownAsHtml(markdown, true).html +
      `</div>`,
  )
}
