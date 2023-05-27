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

  const [textAreaScroll, setTextAreaScroll] = useState({
    top: 0,
    left: 0,
  })

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

  const lineNumbers = value.split("\n").map((l, i) => i + 1)

  function update(text: string) {
    setValue(text.replace(/\r/g, ""))
    if ($highlighted.current === null || $textarea.current === null) {
      return
    }
  }

  function syncScroll() {
    if ($textarea.current === null) {
      return
    }
    setTextAreaScroll({
      top: $textarea.current.scrollTop,
      left: $textarea.current.scrollLeft,
    })
  }

  function onKeyDown(event: KeyboardEvent) {
    if ($textarea.current === null) {
      return
    }
    const element = $textarea.current
    const currentIndex = element.selectionStart
    const textUpToHere = value.substring(0, currentIndex)
    const indexOfLineStart = textUpToHere.lastIndexOf("\n") + 1
    const currentLineBeforeHere = textUpToHere.substring(indexOfLineStart)
    const textAfter = value.substring(element.selectionEnd)

    function submitInstead(toAdd: string) {
      event.preventDefault()
      element.value = textUpToHere + toAdd + textAfter
      update(textUpToHere + toAdd + textAfter)
      element.setSelectionRange(currentIndex + toAdd.length, currentIndex + toAdd.length)
    }

    let code = element.value;
    const tabValue = "  "
    if (event.key === "Tab") {
      if (element.selectionStart === element.selectionEnd && !event.shiftKey) {
        submitInstead(tabValue)
      } else {
        event.preventDefault()

        const endIndex = element.selectionEnd
        const textAfter = value.substring(endIndex)
        const nextNewlineRelative = textAfter.indexOf("\n")
        const nextNewline = nextNewlineRelative < 0 ? value.length : endIndex + nextNewlineRelative
        const textUpToEnd = value.substring(0, endIndex)
        const indexOfEndLineStart = textUpToEnd.lastIndexOf("\n") + 1
        const endLine = value.substring(indexOfEndLineStart, nextNewline)
        const selectedLines = value.substring(indexOfLineStart, indexOfEndLineStart + endLine.length)
        const modifiedLines = event.shiftKey ? selectedLines.replace(/^  /gm, "") : selectedLines.replace(/^/gm, "  ")
        const newValue = value.substring(0, indexOfLineStart) + modifiedLines + value.substring(indexOfLineStart + selectedLines.length)
        element.value = newValue
        update(newValue)
        element.setSelectionRange(indexOfLineStart, indexOfLineStart + modifiedLines.length)
      }
    }

    if (element.selectionStart !== element.selectionEnd) {
      return
    }

    if (event.key === "Enter") {
      const indentMatch = /^\s*/.exec(currentLineBeforeHere)
      if (indentMatch !== null) {
        submitInstead("\n" + indentMatch[0])
      }
    }
    if (event.key === " ") {
      if (/^\s*$/.test(currentLineBeforeHere)) {
        submitInstead(tabValue)
      }
    }
    if (event.key === "Backspace") {
      const lineUpToHere = currentLineBeforeHere.substring(0, currentIndex - indexOfLineStart)
      if (/^(  )+$/.test(lineUpToHere)) {
        event.preventDefault()
        const newValue = textUpToHere.substring(0, indexOfLineStart) + lineUpToHere.substring(0, lineUpToHere.length - 2) + textAfter
        element.value = newValue
        update(newValue)
        element.setSelectionRange(currentIndex - 2, currentIndex - 2)
      }
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

  return <div id={id} style={style} class="code-input">
    <ul
      class="line-numbers"
      style={`width:6ch;padding:10px;padding-right:1ch;top:-${textAreaScroll.top}px;`}
    >
      {lineNumbers.map(i => <li>{i}</li>)}
    </ul>
    <textarea
      ref={$textarea}
      spellcheck={false}
      onInput={(e) => {
        update((e.target as HTMLTextAreaElement).value)
        syncScroll()
      }}
      onScroll={() => syncScroll()}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onPaste={onPaste}
      style="width:100%;height:100%;padding:10px;padding-left:6ch;"
    >{value}</textarea>
    <pre
      ref={$pre}
      style={`min-width:100%;padding:10px;padding-left:6ch;top:-${textAreaScroll.top}px;left:-${textAreaScroll.left}px;border-radius:0;`}
      aria-hidden="true"
      // class="line-numbers"
    >
    <code dangerouslySetInnerHTML={{__html: highlightedHtml}} class="language-thy"></code>
    </pre>
  </div>
}