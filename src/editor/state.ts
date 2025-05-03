import { useEffect, useState } from "preact/hooks"
import {
  getDataFromHistory,
  saveCodeInHistory,
  useSourceCodePopStateListener,
} from "./source-code/history"
import { makeRunner, Output } from "./source-code/runner"
import { generateUID } from "utils/uid"
import { SerializedWorkspace } from "./file/serialized-workspace"

export type SourceCode = {
  readonly path: string
  readonly contents: string
  readonly language: string
}

export function useEditorState() {
  // useSourceCodePopStateListener((state) => {
  //   if (state.source) {
  //     setSourceCode(state.source)
  //   }
  //   setEditorLanguage(state.language)
  //   setFileLoaded(state.fileName)
  // })

  const [sourceCode, setSourceCode] = useState<SourceCode>({
    path: "untitled",
    contents: "",
    language: "thy",
  })

  // useEffect(() => {
  //   saveCodeInHistory(fileLoaded, sourceCode, editorLanguage)
  // }, [fileLoaded, sourceCode, editorLanguage])

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
    output,
    setOutput,
    runThenSetOutput,
  }
}

export type EditorState = ReturnType<typeof useEditorState>
