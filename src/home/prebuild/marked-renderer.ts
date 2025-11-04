import { addThyPrismGrammarAndAwaitAvailable } from "editor/prism-grammar"
import { playgroundBaseUrl } from "home/links"
import { Marked, Renderer } from "marked"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import Prism from "prismjs"
import "prismjs/components/prism-typescript"
import { rootDir } from "root-dir"
import { generateTryButton } from "./button"
import { generateCodeComparison } from "./code-comparison"
import { profileSection } from "./time"

type Options = {
  noTry?: boolean
}

export function makeMarked(options: Options = {}) {
  const marked = new Marked()

  const renderer = new Renderer()

  renderer.code = ({ text, lang, escaped }) => {
    if (!lang) {
      return `<pre><code>${text}</code></pre>`
    }
    const highlighted = Prism.highlight(text, Prism.languages[lang], lang)
    const langClass = lang ? ` class="language-${lang}"` : ""
    const block = `
<pre><code${langClass}>${highlighted}</code></pre>
`
    if (options.noTry) {
      return block
    }
    const button = generateTryButton({
      playgroundUrl: playgroundBaseUrl,
      source: text,
    })
    return `
${block}
${button}
`
  }

  renderer.link = ({ href, title, text }) => {
    if (!href) return text

    href = href.replace(/\.md$/, ".html")

    const isAbsolute = /^https?:\/\//i.test(href)
    const targetAttr = isAbsolute ? ' target="_blank" ' : ""
    const titleAttr = title ? ` title="${title}"` : ""

    return `<a href="${href}"${titleAttr}${targetAttr}>${text}</a>`
  }

  renderer.heading = ({ text, depth }) => {
    // Generate an id (anchor) from the heading text
    const id = text
      .toLowerCase()
      .replace(/[^\w]+/g, "-") // strip punctuation
      .replace(/^-+/, "")
      .replace(/-+$/, "")

    return `
<h${depth} id="${id}">${text}</h${depth}>
`
  }

  marked.use({ renderer })

  return marked
}
