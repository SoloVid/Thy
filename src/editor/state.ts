import { useEffect, useState } from "preact/hooks"
import {
  extractCodeFromHistoryState,
  getDataFromHistory,
  saveCodeInHistory,
  useSourceCodePopStateListener,
} from "./source-code/history"
import { makeRunner, Output } from "./source-code/runner"
import { extractCodeFromUrl } from "./source-code/share-url"
import { generateUID } from "utils/uid"

export type SourceCode = {
  readonly path: string
  readonly contents: string
}

export function useEditorState() {
  useSourceCodePopStateListener((state) => {
    if (state.source) {
      setSourceCode(state.source)
    }
    setEditorLanguage(state.language)
    setFileLoaded(state.fileName)
  })

  function getInitialSourceCode(): SourceCode {
    const sourceFromUrl = extractCodeFromUrl()
    if (sourceFromUrl) {
      return {
        path: "/main.thy",
        contents: sourceFromUrl,
      }
    }
    const sourceFromHistory = extractCodeFromHistoryState()
    if (sourceFromHistory) {
      return {
        path: "/main.thy",
        contents: sourceFromHistory,
      }
    }
    return {
      path: "/main.thy",
      contents: `return "himom"\n`,
    }
  }

  const [editorLanguage, setEditorLanguage] = useState<string>(
    () => getDataFromHistory().language,
  )
  const [sourceCode, setSourceCode] = useState<SourceCode>(getInitialSourceCode)

  const [fileLoaded, setFileLoaded] = useState(
    () => getDataFromHistory().fileName,
  )

  useEffect(() => {
    saveCodeInHistory(fileLoaded, sourceCode, editorLanguage)
  }, [fileLoaded, sourceCode, editorLanguage])

  const [output, setOutput] = useState<Output | string | null>(null)

  const { run } = makeRunner()
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

  return {
    sourceCode,
    setSourceCode,
    fileLoaded,
    setFileLoaded,
    output,
    setOutput,
    runThenSetOutput,
  }
}

export type EditorState = ReturnType<typeof useEditorState>
