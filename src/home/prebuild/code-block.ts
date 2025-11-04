import Prism from "prismjs"
import "prismjs/components/prism-typescript"
import { addThyPrismGrammarAndAwaitAvailable } from "../../editor/prism-grammar"

export type CodeBlockProps = {
  source: string
  language: string
}

function escapeHTML(html: string) {
  const element = document.createElement("div")
  element.textContent = html
  return element.innerHTML
}

export function generateCodeBlock({
  source: sourceUnstripped,
  language,
}: CodeBlockProps) {
  const source = sourceUnstripped.trim()

  if (!language) {
    return `<pre><code>${escapeHTML(source)}</code></pre>`
  }

  // await addThyPrismGrammarAndAwaitAvailable()

  const highlighted = Prism.highlight(
    source,
    Prism.languages[language],
    language,
  )
  return `<pre class="code-block"><code class="language-${language}">${highlighted}</code></pre>`
}
