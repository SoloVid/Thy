import type { JSX } from "preact"
import { useEffect, useMemo, useRef, useState } from "preact/hooks"
import Prism from "prismjs"
import { addThyPrismGrammarAndAwaitAvailable } from "./prism-grammar"

export type CodeInputProps = {
  id: string
  style: string
  value: string
  setValue: (newValue: string) => void
  runCode: () => void
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

export default function CodeInput({
  id,
  style,
  value,
  setValue,
  runCode,
}: CodeInputProps) {
  const $textarea = useRef<HTMLTextAreaElement>(null)
  const $pre = useRef<HTMLPreElement>(null)
  const $highlighted = useRef<HTMLElement>(null)
  const isThyPrismLoaded = useThyPrism()

  useEffect(() => {
    requestAnimationFrame(() => {
      if ($textarea.current !== null) {
        $textarea.current.focus()
        $textarea.current.setSelectionRange(value.length, value.length)
      }
    })
  }, [])

  const highlightedHtml = useMemo(() => {
    const valueToHighlight = value[value.length - 1] == "\n" ? value + " " : value
    return Prism.highlight(valueToHighlight, Prism.languages.thy ?? Prism.languages.javascript, "thy")
  }, [isThyPrismLoaded, value])

  function update(text: string) {
    setValue(text.replace(/\r/g, ""))
    if ($highlighted.current === null || $textarea.current === null) {
      return
    }
  }

  function syncScroll() {
    if ($pre.current === null || $textarea.current === null) {
      return
    }
    /* Scroll result to scroll coords of event - sync with textarea */
    $pre.current.scrollTop = $textarea.current.scrollTop;
    $pre.current.scrollLeft = $textarea.current.scrollLeft;
  }

  function checkTab(event: KeyboardEvent) {
    if ($textarea.current === null) {
      return
    }
    const element = $textarea.current

    let code = element.value;
    const tabValue = "  "
    if (event.key == "Tab") {
      /* Tab key pressed */
      event.preventDefault(); // stop normal
      let before_tab = code.slice(0, element.selectionStart); // text before tab
      let after_tab = code.slice(element.selectionEnd, element.value.length); // text after tab
      let cursor_pos = element.selectionStart + tabValue.length; // where cursor moves after tab - moving forward by 1 char to after tab
      element.value = before_tab + tabValue + after_tab; // add tab char
      // move cursor
      element.selectionStart = cursor_pos;
      element.selectionEnd = cursor_pos;
      update(element.value); // Update text to include indent
    }
  }

  function onPaste(e: JSX.TargetedClipboardEvent<HTMLTextAreaElement>) {
    if ($textarea.current === null) {
      return
    }
    const clipboardData = e.clipboardData
    if (!clipboardData) {
      return
    }
    const pastedText = clipboardData.getData('text/plain');
    e.preventDefault()
    const pasteLines = pastedText.split("\n")
    const currentIndex = $textarea.current.selectionStart
    const textUpToHere = value.substring(0, currentIndex)
    const indexOfLineStart = textUpToHere.lastIndexOf("\n") + 1
    const currentLine = textUpToHere.substring(indexOfLineStart)
    const currentLineIndent = /^ */.exec(currentLine)![0]
    const isIntoLineContent = currentIndex > indexOfLineStart
    const indentToRemove = (pasteLines.length === 1 || !isIntoLineContent) ? /^ */.exec(pasteLines[0])![0] : /^ */.exec(pasteLines[1])![0]
    const alteredPasteText = pasteLines.map((l, i) => {
      if (i === 0 && (currentLine.trim() === "" || isIntoLineContent)) {
        return l.trimStart()
      }
      if (i === pasteLines.length - 1 && l.trim() === "") {
        return currentLineIndent
      }
      return l.replace(new RegExp(`^${indentToRemove}`), currentLineIndent)
    }).join("\n")
    update(textUpToHere + alteredPasteText + value.substring(currentIndex))
  }

  function onKeyUp(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      runCode()
      e.preventDefault()
    }
  }

  return <div id={id} style={style}>
    <textarea
      ref={$textarea}
      id="editing"
      spellcheck={false}
      onInput={(e) => {
        update((e.target as HTMLTextAreaElement).value)
        syncScroll()
      }}
      onScroll={() => syncScroll()}
      onKeyDown={checkTab}
      onKeyUp={onKeyUp}
      onPaste={onPaste}
    >{value}</textarea>
    <pre ref={$pre} id="highlighting" aria-hidden="true">
    <code dangerouslySetInnerHTML={{__html: highlightedHtml}} class="language-html" id="highlighting-content"></code>
    </pre>
  </div>
}