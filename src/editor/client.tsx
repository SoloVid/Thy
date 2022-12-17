import "preact/debug";

import ace from "ace-builds";
import { render } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { interpretThyBlock } from "../interpreter/block";
import { core } from "../std-lib";

type Output = {
  readonly error: null | string
  readonly returnValue: unknown
  readonly printedLines: readonly string[]
}

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

  const [sourceCode, setSourceCode] = useState(() => {
    const base64SourceMatch = /b64=([^&]+)/.exec(window.location.hash)
    if (base64SourceMatch !== null) {
      return atob(base64SourceMatch[1])
    }
    return `return "himom"\n`
  })

  function run(sourceCode: string): Output {
    let error: null | string = null
    let returnValue: unknown = undefined
    let printedLines: string[] = []
    try {
      const interpreted = interpretThyBlock(sourceCode)
      const playgroundLib = {
        ...core,
        print: (thing: unknown) => {
          console.log(thing)
          printedLines.push("" + thing)
        },
        fetch,
      }
      returnValue = interpreted(playgroundLib)
    } catch (e) {
      console.error(e)
      if (e instanceof Error) {
        error = e.stack ?? e.message
      }
      error = JSON.stringify(e)
    }
    return {
      error,
      returnValue,
      printedLines,
    }
  }

  const [output, setOutput] = useState<Output>(() => {
    return run(sourceCode)
  })

  function onSourceCodeChange(newSource: string) {
    setSourceCode(newSource)
    history.replaceState(null, "", `#b64=${btoa(newSource)}`)
  }

  function submitSourceCode(newSource: string) {
    onSourceCodeChange(newSource)
    setOutput(run(newSource))
  }

  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current !== null) {
      const editor = ace.edit(editorRef.current, {
        scrollPastEnd: true,
      })
      editor.on("change", () => {
        onSourceCodeChange(editor.getValue())
      })
      editor.setValue(sourceCode)
      editor.clearSelection()
      editor.focus()
      editor.commands.addCommand({
        name: 'run',
        bindKey: {win: 'Ctrl-R',  mac: 'Command-R'},
        exec: function(editor) {
            submitSourceCode(editor.getValue())
        },
        readOnly: true, // false if this command should not apply in readOnly mode
        // multiSelectAction: "forEach", optional way to control behavior with multiple cursors
        // scrollIntoView: "cursor", control how cursor is scolled into view after the command
      });
      // editor.setTheme("ace/theme/monokai")
      // editor.session.setMode("ace/mode/javascript")
    }
  }, [editorRef.current])

  return <div style={`height:100vh;height:${windowHeight}px;`}>
    {/* <div style="padding: 20px;height:100%;"> */}
      {/* <div style="background-color: red;height:100%;"> */}
        <div ref={editorRef} id="editor" style={`position:relative; width: 100%; height: ${editorHeight}px;`}></div>
        <div>
          <span onClick={() => run(sourceCode)} style="cursor:pointer;padding:15px;background-color:rgb(100,200,220);color:white;font-size:20px;display:block;">Run</span>
          {output.error !== null && <div>
            <h3>Error</h3>
            <pre>{output.error}</pre>
          </div>}
          {output.returnValue !== undefined && <div>
            <h3>Return Value</h3>
            <pre>{"" + output.returnValue}</pre>
          </div>}
          {output.printedLines.length > 0 && <div>
            <h3>Printed Lines</h3>
            <pre>{output.printedLines.join("\n")}</pre>
          </div>}
        </div>
      {/* </div> */}
    {/* </div> */}
  </div>
}

render(<App />, document.getElementById('app') as HTMLElement);
