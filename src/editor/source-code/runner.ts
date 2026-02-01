import { interpretThyWorkspace } from "@/interpreter/workspace.ts"
import { core } from "std-lib/core/index.ts"
import { dissectErrorTraceAtCloserBaseline } from "utils/error-helper.ts"
import type { FileBrowseApi } from "utils/fs/file-browse-api.ts"
import { FilesApi, makeThyFilesApi } from "../file/files-api.ts"
import { makeFileManager } from "../file/local-files.ts"

export type Output = {
  readonly error: null | string
  readonly returnValue: unknown
  readonly printedLines: readonly string[]
}

export function makeRunner() {
  const rawFileManager = makeFileManager()

  async function run(fs: FilesApi, entrypoint: string): Promise<Output> {
    let error: null | string = null
    let returnValue: unknown = undefined
    let printedLines: string[] = []
    const errorHere = new Error()
    try {
      const playgroundLib = {
        ...core,
        print: (thing: unknown) => {
          console.log(thing)
          printedLines.push("" + thing)
        },
        file: makeThyFilesApi(rawFileManager),
      }
      const workspaceBrowser: FileBrowseApi = {
        async list(path) {
          const rawList = await fs.list(path)
          return rawList.map((e) => ({
            name: e.name.replace(/^\/|\/$/, ""),
            isDirectory: e.kind === "directory",
          }))
        },
        read(path) {
          return fs.read(path)
        },
      }
      returnValue = await interpretThyWorkspace(
        workspaceBrowser,
        entrypoint.replace(/^\//, ""),
        playgroundLib,
      )
    } catch (e) {
      console.error(e)
      if (e instanceof Error) {
        if (!e.stack) {
          error = e.message
        } else {
          const dissectedError = dissectErrorTraceAtCloserBaseline(
            e,
            errorHere,
            0,
            new Error(),
            0,
          )
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

  return { run }
}
