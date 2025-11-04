import { generateApiIndexMarkdown } from "../../api-index"
import { generateHtml } from "../../helper"
import { renderMarkdownAsHtml } from "../../markdown"

export default async () => {
  const indexMarkdown = await generateApiIndexMarkdown("std-lib/core")
  const markdown = `# Core Standard Library

## Overview

The core standard library for Thy is the base set of functions and
values that should be available in any Thy runtime environment.
Many of these functions are provided as language features in other languages.
Where appropriate, links are provided to equivalent TypeScript functionality
for further reading.

${indexMarkdown}
`
  await generateHtml(
    "std-lib/core/index.html",
    "Core Standard Library",
    `<div class="column-content-md">` +
      renderMarkdownAsHtml(markdown, true).html +
      `</div>`,
  )
}
