import "preact/debug";

import ace from "ace-builds";
import { render } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { interpretThyBlock } from "../interpreter/block";
import { core } from "../std-lib";

export default function App() {

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
  const editorHeight = Math.min(windowHeight, 500)

  const [sourceCode, setSourceCode] = useState(`return "himom"\n`)
  const [runIt, setRunIt] = useState(() => () => undefined)
  const output = useMemo(() => {
    try {
      const interpreted = interpretThyBlock(sourceCode)
      return interpreted(core)
    } catch (e) {
      if (e instanceof Error) {
        return e.stack ?? e.message
      }
      return JSON.stringify(e)
    }
  }, [sourceCode])

  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current !== null) {
      const editor = ace.edit(editorRef.current, {
        scrollPastEnd: true,
      })
      editor.setValue(sourceCode)
      editor.clearSelection()
      editor.focus()
      setRunIt(() => () => {
        const editorValue = editor.getValue()
        console.log("Submitting new source...")
        console.log(editorValue)
        setSourceCode(editorValue)
        return undefined
      })
      // editor.setTheme("ace/theme/monokai")
      // editor.session.setMode("ace/mode/javascript")
    }
  }, [editorRef.current])

  return <div style={`height:100vh;height:${windowHeight}px;`}>
    {/* <div style="padding: 20px;height:100%;"> */}
      {/* <div style="background-color: red;height:100%;"> */}
        <div ref={editorRef} id="editor" style={`position:relative; width: 100%; height: ${editorHeight}px;`}></div>
        <div>
          <span onClick={() => runIt()} style="cursor:pointer;padding:15px;background-color:rgb(100,200,220);color:white;font-size:20px;display:block;">Run</span>
          <pre>{output}</pre>
        </div>
      {/* </div> */}
    {/* </div> */}
  </div>
}

render(<App />, document.getElementById('app') as HTMLElement);
