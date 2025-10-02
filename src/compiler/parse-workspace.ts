import { CompileError } from "common"
import { parse } from "parser/parser"
import { resolvePathSpec } from "std-lib/thy/resolve-path-spec"
import { makeTokenizer } from "tokenizer"
import { Block } from "tree"
import { FileBrowseApi } from "utils/fs/file-browse-api"

export interface ParseResult {
  tree: Readonly<Block>
  tokenizerErrors: readonly CompileError[]
  parserErrors: readonly CompileError[]

  // getAllErrors(): readonly CompileError[]
}

export async function parseAll(workspaceBrowser: FileBrowseApi, entrypoint: string) {
  const workspaceParseMap: Map<string, ParseResult> = new Map()
  await parseRecursive(workspaceParseMap, workspaceBrowser, entrypoint)
  return workspaceParseMap
}

export async function parseRecursive(workspaceParseMap: Map<string, ParseResult>, workspaceBrowser: FileBrowseApi, entrypoint: string) {
  if (workspaceParseMap.has(entrypoint)) {
    return
  }
  const source = await workspaceBrowser.read(entrypoint)
  const tokenizerErrors: CompileError[] = []
  const tokenizer = makeTokenizer(source, tokenizerErrors)
  const parseResult = parse(tokenizer)
  workspaceParseMap.set(entrypoint, {
    tree: parseResult.top,
    tokenizerErrors: tokenizerErrors,
    parserErrors: parseResult.errors,
  })
  for (const rawRef of parseResult.references) {
    const expandedRefs = await resolvePathSpec(entrypoint, workspaceBrowser, rawRef)
    for (const expandedRef of expandedRefs) {
      await parseRecursive(workspaceParseMap, workspaceBrowser, expandedRef)
    }
  }
}
