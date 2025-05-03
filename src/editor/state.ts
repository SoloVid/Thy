import { useState } from "preact/hooks"
import { generateUID } from "utils/uid"
import { makeRunner, Output } from "./source-code/runner"

export type SourceCode = {
  readonly path: string
  readonly contents: string
  readonly language: string
}

export function useEditorState() {
  const [sourceCode, setSourceCode] = useState<SourceCode>({
    path: "untitled",
    contents: "",
    language: "thy",
  })

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
