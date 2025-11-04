import { interpretThyWorkspace } from "interpreter/workspace"
import { core } from "std-lib/core"
import { dissectErrorTraceAtCloserBaseline } from "utils/error-helper"
import { FilesApi, makeThyFilesApi } from "../file/files-api"
import { makeFileManager } from "../file/local-files"

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
      returnValue = await interpretThyWorkspace(fs, entrypoint, playgroundLib)
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
