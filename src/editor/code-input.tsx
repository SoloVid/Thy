import { useMemo, useRef } from "preact/hooks";
import Prism from "prismjs"

export type CodeInputProps = {
  value: string
  setValue: (newValue: string) => void
}

export default function CodeInput({
  value,
  setValue,
}: CodeInputProps) {
  const $textarea = useRef<HTMLTextAreaElement>(null)
  const $pre = useRef<HTMLPreElement>(null)
  const $highlighted = useRef<HTMLElement>(null)

  const highlightedHtml = useMemo(() => {
    const valueToHighlight = value[value.length - 1] == "\n" ? value + " " : value
    return Prism.highlight(valueToHighlight, Prism.languages.html, "html")
  }, [value])

  function update(text: string) {
    setValue(text)
    if ($highlighted.current === null || $textarea.current === null) {
      return
    }
    // // Handle final newlines (see article)
    // if (text[text.length - 1] == "\n") {
    //   text += " ";
    // }
    // // Update code
    // $highlighted.current.innerHTML = text.replace(new RegExp("&", "g"), "&amp;").replace(new RegExp("<", "g"), "&lt;"); /* Global RegExp */
    // // Syntax Highlight
    // Prism.highlightElement($highlighted.current);
  }

  function sync_scroll() {
    if ($pre.current === null || $textarea.current === null) {
      return
    }
    /* Scroll result to scroll coords of event - sync with textarea */
    $pre.current.scrollTop = $textarea.current.scrollTop;
    $pre.current.scrollLeft = $textarea.current.scrollLeft;
  }

  function check_tab(event: KeyboardEvent) {
    if ($textarea.current === null) {
      return
    }
    const element = $textarea.current

    let code = element.value;
    if (event.key == "Tab") {
      /* Tab key pressed */
      event.preventDefault(); // stop normal
      let before_tab = code.slice(0, element.selectionStart); // text before tab
      let after_tab = code.slice(element.selectionEnd, element.value.length); // text after tab
      let cursor_pos = element.selectionStart + 1; // where cursor moves after tab - moving forward by 1 char to after tab
      element.value = before_tab + "  " + after_tab; // add tab char
      // move cursor
      element.selectionStart = cursor_pos;
      element.selectionEnd = cursor_pos;
      update(element.value); // Update text to include indent
    }
  }

  return <div style="height: 200px;">
    <textarea ref={$textarea} id="editing" spellcheck={false} onInput={(e) => {
      update(e.target.value)
      sync_scroll()
    }} onScroll={() => sync_scroll()} onKeyDown={check_tab}>{value}</textarea>
    <pre ref={$pre} id="highlighting" aria-hidden="true">
    <code dangerouslySetInnerHTML={{__html: highlightedHtml}} class="language-html" id="highlighting-content"></code>
    {/* <code ref={$highlighted} class="language-html" id="highlighting-content">{value}</code> */}
    </pre>
  </div>
}