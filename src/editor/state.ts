import { useState } from "preact/hooks"
import { generateUID } from "utils/uid"
import { makeRunner, Output } from "./source-code/runner"
import { InMemoryFiles, makeInMemoryFiles } from "./file/in-memory-files"
import { getPersistedWorkspace } from "./source-code/persisted-workspace"

export type SourceCode = {
  readonly path: string
  readonly contents: string
  readonly language: string
}

export function useEditorState() {
  const [fs, setFs] = useState<InMemoryFiles>(() => {
    const fs = makeInMemoryFiles(() => new Date().getTime())
    fs.ingest(getPersistedWorkspace())
    return fs
  })

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
    run(fs, sourceCode.path).then((newOutput) => {
      setOutput((before) => {
        if (before === uid) {
          return newOutput
        }
        return before
      })
    })
  }

  return {
    fs,
    sourceCode,
    setSourceCode,
    output,
    setOutput,
    runThenSetOutput,
  }
}

export type EditorState = ReturnType<typeof useEditorState>
