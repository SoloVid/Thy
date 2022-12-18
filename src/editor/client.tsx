import "preact/debug"

import ace, { Ace } from "ace-builds"
import { render } from "preact"
import { useEffect, useRef, useState } from "preact/hooks"
import { interpretThyBlock } from "../interpreter/block"
import { generateUID } from "../interpreter/split-line"
import { core } from "../std-lib"
import { makeThyFilesApi } from "./files-api"
import { makeFileManager, useLocalFiles } from "./local-files"

type Output = {
  readonly error: null | string
  readonly returnValue: unknown
  readonly printedLines: readonly string[]
}

window.onbeforeunload = function() {
  return true
}

let lastAcePoint: Ace.Point | null = null

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

  const [sourceCodeState, setSourceCode] = useState(() => {
    const base64SourceMatch = /b64=([^&]+)/.exec(window.location.hash)
    if (base64SourceMatch !== null) {
      return atob(base64SourceMatch[1])
    }
    return `return "himom"\n`
  })

  const rawFileManager = makeFileManager()
  const fileMan = useLocalFiles(rawFileManager)

  async function run(sourceCode: string): Promise<Output> {
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
        files: makeThyFilesApi(rawFileManager)
      }
      returnValue = await interpreted(playgroundLib)
    } catch (e) {
      console.error(e)
      if (e instanceof Error) {
        error = e.stack ?? e.message
      } else {
        error = JSON.stringify(e)
      }
    }
    return {
      error,
      returnValue,
      printedLines,
    }
  }

  const [output, setOutput] = useState<Output | string>({
    error: null,
    returnValue: undefined,
    printedLines: [],
  })
  function runThenSetOutput(code: string) {
    const uid = generateUID()
    setOutput(uid)
    run(code).then((newOutput) => {
      setOutput((before) => {
        if (before === uid) {
          return newOutput
        }
        return before
      })
    })
  }

  function onSourceCodeChange(newSource: string) {
    setSourceCode(newSource)
    history.replaceState(null, "", `#b64=${btoa(newSource)}`)
  }

  async function submitSourceCode(newSource: string) {
    onSourceCodeChange(newSource)
    runThenSetOutput(newSource)
  }

  const [showFileMenu, setShowFileMenu] = useState(false)
  const [fileLoaded, setFileLoaded] = useState("")

  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current !== null) {
      // console.log("new editor", fileLoaded)
      const editor = ace.edit(editorRef.current, {
        scrollPastEnd: true,
      })
      // editor.setShowFoldWidgets(true)
      // editor.setFadeFoldWidgets(true)
      editor.on("change", () => {
        onSourceCodeChange(editor.getValue())
      })
      editor.setValue(sourceCodeState)
      if (lastAcePoint !== null) {
        editor.moveCursorToPosition(lastAcePoint)
      }
      editor.focus()
      editor.clearSelection()
      editor.on("paste", (e) => {
        // console.log(e)
        const pasteLines = e.text.split("\n")
        // if (pasteLines.length === 1 || (pasteLines.length === 2 && pasteLines[1].trim() === "")) {
        //   return
        // }
        // console.log("paste", pasteLines)
        const currentPosition = editor.getCursorPosition()
        const currentLine = editor.getValue().split("\n")[currentPosition.row]
        const currentLineIndent = /^ */.exec(currentLine)![0]
        const isIntoLineContent = currentPosition.column > currentLineIndent.length
        const indentToRemove = (pasteLines.length === 1 || !isIntoLineContent) ? /^ */.exec(pasteLines[0])![0] : /^ */.exec(pasteLines[1])![0]
        // console.log("indentToRemove", indentToRemove, indentToRemove.length)
        e.text = pasteLines.map((l, i) => {
          if (i === 0 && (currentLine.trim() === "" || isIntoLineContent)) {
            return l.trimStart()
          }
          if (i === pasteLines.length - 1 && l.trim() === "") {
            return currentLineIndent
          }
          return l.replace(new RegExp(`^${indentToRemove}`), currentLineIndent)
        }).join("\n")
        // console.log(currentPosition.column, currentLine)
        // e.text = "no"
      })
      editor.commands.addCommand({
        name: 'run',
        bindKey: {win: 'Ctrl-Enter',  mac: 'Command-Enter'},
        exec: function(editor) {
          const source = editor.getValue()
          submitSourceCode(source)
        },
        readOnly: true, // false if this command should not apply in readOnly mode
        // multiSelectAction: "forEach", optional way to control behavior with multiple cursors
        // scrollIntoView: "cursor", control how cursor is scrolled into view after the command
      })
      editor.session.setNewLineMode("unix")
      editor.session.setTabSize(2)
      editor.session.setUseSoftTabs(true)
      editor.session.setUseWrapMode(true)
      // editor.setTheme("ace/theme/monokai")
      // editor.session.setMode("ace/mode/javascript")
      return () => {
        lastAcePoint = editor.getCursorPosition()
        editor.destroy()
      }
    }
  }, [editorRef.current, fileLoaded])

  return <div style={`height:100vh;height:${windowHeight}px;`}>
    {/* <div style="padding: 20px;height:100%;"> */}
      {/* <div style="background-color: red;height:100%;"> */}
        <div ref={editorRef} id="editor" style={`position:relative; width: 100%; height: ${editorHeight}px;`}></div>
        <div>
          <div className="btn-panel">
            <span onClick={() => runThenSetOutput(sourceCodeState)} className="btn">Run</span>
            <span onClick={() => setShowFileMenu(before => !before)} className="btn">File</span>
          </div>
          {showFileMenu && (<>
            <ul>
              {fileMan.files.length === 0 && <li>No saved files</li>}
              {fileMan.files.map(f => (
                <li>
                  <span className="small-btn" onClick={() => {
                    fileMan.saveFile(f, sourceCodeState)
                    setFileLoaded(f)
                  }}>Save</span>
                  <span className="small-btn" onClick={() => {
                    const contents = fileMan.getFile(f)
                    if (contents === null) {
                      return
                    }
                    setSourceCode(contents)
                    setFileLoaded(f)
                  }}>Load</span>
                  <span className="small-btn" onClick={() => fileMan.deleteFile(f)}>Delete</span>
                  <strong>{f}</strong>
                </li>
              ))}
                <li>
                  <span className="small-btn" onClick={() => {
                    const newName = fileMan.saveAsNew(sourceCodeState)
                    if (!!newName) {
                      setFileLoaded(newName)
                    }
                  }}>Save as New</span>
                  <span className="small-btn" onClick={() => {
                    if (!window.confirm("Clear editor?")) {
                      return
                    }
                    setSourceCode("")
                    setFileLoaded("")
                  }}>Clear</span>
                </li>
            </ul>
            <hr/>
          </>)}
          {typeof output === "string" ? (
            <h4>Running...</h4>
          ): (<>
            {output.error !== null && <div>
              <h3>Error</h3>
              <pre className="output">{output.error}</pre>
              <hr/>
            </div>}
            {output.returnValue !== undefined && <div>
              <h3>Return Value</h3>
              <pre className="output">{JSON.stringify(output.returnValue)}</pre>
              <hr/>
            </div>}
            {output.printedLines.length > 0 && <div>
              <h3>Printed Lines</h3>
              <pre className="output">{output.printedLines.join("\n")}</pre>
              <hr/>
            </div>}
          </>)}
        </div>
      {/* </div> */}
    {/* </div> */}
  </div>
}

render(<App />, document.getElementById('app') as HTMLElement);
