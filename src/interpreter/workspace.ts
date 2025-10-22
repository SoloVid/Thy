import { parseAll } from "compiler/parse-workspace"
import { FileBrowseApi } from "utils/fs/file-browse-api"
import { BlockOptions } from "./block-options"
import { makeInterpreterCompileError } from "./interpreter-error"
import { makeThyResolver } from "./thy-resolver"

export async function interpretThyWorkspace(
  workspaceBrowser: FileBrowseApi,
  entrypoint: string,
  globals: Record<string, unknown>,
  options: Partial<BlockOptions> = {},
): Promise<unknown> {
  const workspaceParseMap = await parseAll(workspaceBrowser, entrypoint)
  // TODO: Handle all errors instead of just one
  workspaceParseMap.forEach((parseResult, path) => {
    for (const error of parseResult.tokenizerErrors) {
      throw makeInterpreterCompileError(error)
    }
    for (const error of parseResult.parserErrors) {
      throw makeInterpreterCompileError(error)
    }
  })
  const parseMap = new Map(
    [...workspaceParseMap.entries()].map(([path, parseResult]) => [
      path,
      parseResult.tree,
    ]),
  )
  const resolver = makeThyResolver(parseMap, globals, {
    closure: options.closure ?? {},
    functionName: options.functionName,
    stackTracePath: options.stackTracePath ?? "inline-thy-code",
    additionalTraceLinesToHide: options.additionalTraceLinesToHide ?? 0,
  })
  return resolver.resolveThy(entrypoint, entrypoint)
}
