import { render } from "preact"
import { useEffect, useState } from "preact/hooks"
import { interpretThyBlock } from "../interpreter/block"
import { generateUID } from "../interpreter/split-line"
import { core } from "../std-lib/core"
import { dissectErrorTraceAtCloserBaseline } from "../utils/error-helper"
import CodeInput from "./code-input"
import { makeThyFilesApi } from "./files-api"
import { makeFileManager, useLocalFiles } from "./local-files"

type Output = {
  readonly error: null | string
  readonly returnValue: unknown
  readonly printedLines: readonly string[]
}

export default function Playground() {
  useEffect(() => {
    document.title = "Thy Playground"
  }, [])
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

  const [sourceCode, setSourceCodeInner] = useState(() => {
    const base64SourceMatch = /b64=([^&]+)/.exec(window.location.hash)
    if (base64SourceMatch !== null) {
      return atob(base64SourceMatch[1])
    }
    return `return "himom"\n`
  })

  const rawFileManager = makeFileManager()
  const fileMan = useLocalFiles(rawFileManager)

  async function run(sourceCodeToRun: string): Promise<Output> {
    let error: null | string = null
    let returnValue: unknown = undefined
    let printedLines: string[] = []
    const errorHere = new Error()
    try {
      const interpreted = interpretThyBlock(sourceCodeToRun)
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
        if (!e.stack) {
          error = e.message
        } else {
          const dissectedError = dissectErrorTraceAtCloserBaseline(e, errorHere, 0, new Error(), 0)
          error = `${e.name}: ${e.message}\n${dissectedError.delta}`
        }
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

  function setSourceCode(newSource: string) {
    setSourceCodeInner(newSource)
    history.replaceState(null, "", `#b64=${btoa(newSource)}`)
  }

  const [showFileMenu, setShowFileMenu] = useState(false)
  const [fileLoaded, setFileLoaded] = useState("")

  return <div style={`height:100vh;height:${windowHeight}px;`}>
    <CodeInput
      id="editor"
      style={`position:relative; width: 100%; height: ${editorHeight}px;`}
      value={sourceCode}
      setValue={setSourceCode}
      runCode={() => runThenSetOutput(sourceCode)}
    ></CodeInput>
    <div>
      <div className="button-panel">
        <a onClick={() => runThenSetOutput(sourceCode)} className="large button">Run</a>
        <a onClick={() => setShowFileMenu(before => !before)} className="large button">File</a>
      </div>
      {showFileMenu && (<>
        <ul>
          {fileMan.files.length === 0 && <li>No saved files</li>}
          {fileMan.files.map(f => (
            <li>
              <a className="small button" onClick={() => {
                fileMan.saveFile(f, sourceCode)
                setFileLoaded(f)
              }}>Save</a>
              <a className="small button" onClick={() => {
                const contents = fileMan.getFile(f)
                if (contents === null) {
                  return
                }
                setSourceCode(contents)
                setFileLoaded(f)
              }}>Load</a>
              <a className="small button" onClick={() => fileMan.deleteFile(f)}>Delete</a>
              <strong>{f}</strong>
            </li>
          ))}
            <li>
              <a className="small button" onClick={() => {
                const newName = fileMan.saveAsNew(sourceCode)
                if (!!newName) {
                  setFileLoaded(newName)
                }
              }}>Save as New</a>
              <a className="small button" onClick={() => {
                if (!window.confirm("Clear editor?")) {
                  return
                }
                setSourceCode("")
                setFileLoaded("")
              }}>Clear</a>
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
          <pre className="output">{JSON.stringify(output.returnValue, null, 2)}</pre>
          <hr/>
        </div>}
        {output.printedLines.length > 0 && <div>
          <h3>Printed Lines</h3>
          <pre className="output">{output.printedLines.join("\n")}</pre>
          <hr/>
        </div>}
      </>)}
    </div>
  </div>
}
