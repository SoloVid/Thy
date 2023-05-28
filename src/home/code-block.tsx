import type { JSX } from "preact"
import { useEffect, useMemo, useRef, useState } from "preact/hooks"
import Prism from "prismjs"
import { addThyPrismGrammarAndAwaitAvailable } from "../editor/prism-grammar"

export type CodeBlockProps = {
  source: string
  language: string
}

export function useThyPrism() {
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  useEffect(() => {
    addThyPrismGrammarAndAwaitAvailable().then(() => {
      setIsLoaded(true)
    })
  }, [])
  return isLoaded
}

function escapeHTML(html: string) {
  var element = document.createElement('div');
  element.textContent = html;
  return element.innerHTML;
}

export default function CodeBlock({
  source: sourceUnstripped,
  language,
  ...remainingProps
}: CodeBlockProps & JSX.HTMLAttributes<HTMLPreElement>) {
  const $pre = useRef<HTMLPreElement>(null)
  const isThyPrismLoaded = useThyPrism()

  const source = useMemo(() => sourceUnstripped.trim(), [sourceUnstripped])

  const highlightedHtml = useMemo(() => {
    if (!isThyPrismLoaded) {
      return escapeHTML(source)
    }
    return Prism.highlight(source, Prism.languages[language], language)
  }, [isThyPrismLoaded, source])

  return <pre
    ref={$pre}
    {...remainingProps}
  >
    <code dangerouslySetInnerHTML={{__html: highlightedHtml}} class={`language-${language}`}></code>
  </pre>
}