import { render } from "preact"
import { useEffect, useState } from "preact/hooks"
import { interpretThyBlock } from "../interpreter/block"
import { generateUID } from "../interpreter/split-line"
import { core } from "../std-lib/core"
import { dissectErrorTraceAtCloserBaseline } from "../utils/error-helper"
import CodeInput from "./code-input"
import { makeThyFilesApi } from "./files-api"
import { makeFileManager, useLocalFiles } from "./local-files"
import { compressToEncodedURIComponent as compressLz, decompressFromEncodedURIComponent as decompressLz } from "lz-string"
import { CopyToClipboardButton } from "../home/button"

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

  useEffect(() => {
    const listener = () => {
      setSourceCode(getInitialSourceCode())
    }
    window.addEventListener("popstate", listener)
    return () => window.removeEventListener("popstate", listener)
  })

  function saveCodeInHistory(newSource: string) {
    try {
      history.replaceState(
        { lz: compressLz(newSource) },
        "",
        window.location.pathname + window.location.search
      )
    } catch (e) {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      )
    }
  }

  function extractCodeFromUrl() {
    try {
      const base64UrlSourceMatch = /b64=([^&]+)/.exec(window.location.hash)
      if (base64UrlSourceMatch !== null) {
        return atob(base64UrlSourceMatch[1])
      }
      const lzUrlSourceMatch = /lz=([^&]+)/.exec(window.location.hash)
      if (lzUrlSourceMatch !== null) {
        return decompressLz(lzUrlSourceMatch[1])
      }
    } catch (e) {
      console.error(e)
      window.alert(`Error parsing source in URL: ${e}`)
    }
    return null
  }

  function extractCodeFromHistoryState() {
    try {
      const lzString = history.state?.lz as string | undefined
      if (lzString) {
        return decompressLz(lzString)
      }
    } catch (e) {
      console.error(e)
      window.alert(`Error parsing source in history state: ${e}`)
    }
    return null
  }

  function getInitialSourceCode() {
    const sourceFromUrl = extractCodeFromUrl()
    if (sourceFromUrl) {
      saveCodeInHistory(sourceFromUrl)
      return sourceFromUrl
    }
    const sourceFromHistory = extractCodeFromHistoryState()
    if (sourceFromHistory) {
      return sourceFromHistory
    }
    return `return "himom"\n`
  }

  const [sourceCode, setSourceCodeInner] = useState(getInitialSourceCode)

  function getShareUrl() {
    return window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search + "#lz=" + compressLz(sourceCode)
  }

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
    saveCodeInHistory(newSource)
  }

  const [showFileMenu, setShowFileMenu] = useState(false)
  const [fileLoaded, setFileLoaded] = useState("")

  return <div class="playground-container" style={`height:100vh;height:${windowHeight}px;`}>
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
        <CopyToClipboardButton
          extraButtonClass="large"
          getValue={() => getShareUrl()}
          tooltip="Copied URL"
        >Share</CopyToClipboardButton>
        <CopyToClipboardButton
          extraButtonClass="large"
          getValue={() => sourceCode}
          tooltip="Copied code"
        >Copy</CopyToClipboardButton>
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
