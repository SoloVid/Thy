import { SerializedWorkspace } from "editor/file/serialized-workspace.ts"
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks"
import { catchReject } from "utils/promise-helper.ts"
import { generateUID } from "utils/uid.ts"
import { InMemoryFiles, makeInMemoryFiles } from "../file/in-memory-files.ts"
import { getPersistedWorkspace } from "./persisted-workspace.ts"
import { makeRunner, Output } from "./runner.ts"

export type SourceFile = {
  readonly path: string
  readonly contents: string
  readonly language: string
}

type WritesInFlight = {
  write: PromiseLike<unknown> | null
  queuedWrite: string | null
}

export function useSourceCodeManager(fs: InMemoryFiles) {
  const [isLoading, setLoading] = useState<boolean>(true)
  const activeOperations = useRef<WritesInFlight>({
    write: null,
    queuedWrite: null,
  })

  const [sourceOpen, setSourceOpen] = useState<SourceFile | null>(null)

  const [output, setOutput] = useState<Output | string | null>(null)
  const [isOutputStale, setOutputStale] = useState<boolean>(true)

  const loadFile = useCallback(
    async (path: string) => {
      try {
        setLoading(true)
        const contents = await fs.read(path)
        setSourceOpen({
          path: path,
          contents: contents,
          language: "thy", // TODO: Update language dynamically.
        })
        setOutputStale(true)
      } finally {
        setLoading(false)
      }
    },
    [setLoading, fs, setSourceOpen, setOutputStale],
  )

  const loadWorkspace = useCallback(
    async (workspace: SerializedWorkspace) => {
      setLoading(true)
      fs.ingest(workspace.root)
      if (workspace.selectedPath === null) {
        setSourceOpen(null)
        setLoading(false)
      } else {
        await loadFile(workspace.selectedPath)
      }
    },
    [setLoading, fs, setSourceOpen, loadFile],
  )

  useEffect(() => {
    catchReject(
      async () => {
        const workspace = getPersistedWorkspace()
        await loadWorkspace(workspace)
      },
      (e) => {
        console.error(e)
        setSourceOpen(null)
        setLoading(false)
      },
    )
  }, [])

  const { run } = makeRunner()
  async function runThenSetOutput() {
    if (!sourceOpen) {
      throw new Error("No source file selected to run")
    }
    const uid = generateUID()
    setOutput(uid)
    const newOutput = await run(fs, sourceOpen.path)
    setOutput((before) => {
      if (before === uid) {
        return newOutput
      }
      return before
    })
    setOutputStale(false)
  }

  async function updateSource(newSource: string) {
    if (!sourceOpen) {
      throw new Error("No source file selected to update")
    }
    const targetPath = sourceOpen.path
    activeOperations.current.queuedWrite = newSource
    if (activeOperations.current.write) {
      return
    }
    setSourceOpen({
      path: targetPath,
      contents: newSource,
      language: "thy",
    })
    try {
      while (activeOperations.current.queuedWrite !== null) {
        const content = activeOperations.current.queuedWrite
        activeOperations.current.queuedWrite = null
        activeOperations.current.write = fs.write(targetPath, content)
        await activeOperations.current.write
        setOutputStale(true)
      }
    } finally {
      activeOperations.current.write = null
    }
  }

  async function selectFile(path: string | null) {
    if (path === null) {
      setSourceOpen(null)
      return
    }
    // TODO: Could produce double error. :/
    await activeOperations.current.write
    await loadFile(path)
  }

  return {
    isLoading,
    loadWorkspace,
    sourceOpen,
    updateSource,
    selectFile,
    output,
    isOutputStale,
    run: runThenSetOutput,
  }
}

export type SourceCodeManager = ReturnType<typeof useSourceCodeManager>
