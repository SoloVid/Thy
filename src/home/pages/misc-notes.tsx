import "preact/debug"

import { render } from "preact"
import { useEffect, useState } from "preact/hooks"
// @ts-expect-error This import is only valid because of esbuild magic.
import notesMd from "../../../notes.md"
import { home } from "../links"
import { ThyMarkdown } from "../markdown-code-block-replace"

console.log(notesMd)

export default function App() {
  const notesMdAsString = notesMd as string
  const [windowHeight, setWindowHeight] = useState(window.innerHeight)
  useEffect(() => {
    const listener = () => {
      setWindowHeight(window.innerHeight)
    }
    const intervalHandle = setInterval(listener, 500)
    window.addEventListener("resize", listener)
    return () => {
      window.removeEventListener("resize", listener)
      clearInterval(intervalHandle)
    }
  })

  return <div class="background">
    <div class="column-content-sm">
    <a href={home}><h1 class="text-center">Thy (lang)</h1></a>
      <h4 class="text-center">
        <em>My language is thy language</em>
      </h4>
    </div>
    <div class="column-content-sm">
      <p>
        This page dumps some unsorted thoughts regarding Thy's language design.
        There is a decent chance these notes are significantly out of date with the current implementation.
      </p>
    </div>
    <div class="column-content-sm">
      <ThyMarkdown>{notesMdAsString}</ThyMarkdown>
      {/* <Markdown
        options={{
          overrides: {
            pre: MarkdownCodeBlockReplace
          }
        }}
      >{notesMdAsString}</Markdown> */}
    </div>
  </div>
}

render(<App />, document.getElementById('app') as HTMLElement);
