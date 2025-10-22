import { CompileError } from "common"
import { relative } from "node:path/posix"
import { parse } from "parser/parser"
import { resolvePathSpec } from "std-lib/thy/resolve-path-spec"
import { makeTokenizer } from "tokenizer"
import { Block } from "tree"
import { FileBrowseApi } from "utils/fs/file-browse-api"

type DependencySpec = {
  id: string
  relativePath: string
  suggestedName: string
}
type ReferenceMap = Record<string, readonly DependencySpec[]>

export interface ParseResult {
  tree: Readonly<Block>
  references: ReferenceMap
  tokenizerErrors: readonly CompileError[]
  parserErrors: readonly CompileError[]

  // getAllErrors(): readonly CompileError[]
}

export async function parseAll(
  workspaceBrowser: FileBrowseApi,
  entrypoint: string,
) {
  const workspaceParseMap: Map<string, ParseResult> = new Map()
  await parseRecursive(workspaceParseMap, workspaceBrowser, entrypoint)
  return workspaceParseMap
}

async function parseRecursive(
  workspaceParseMap: Map<string, ParseResult>,
  workspaceBrowser: FileBrowseApi,
  entrypoint: string,
) {
  if (workspaceParseMap.has(entrypoint)) {
    return
  }
  const source = await workspaceBrowser.read(entrypoint)
  const tokenizerErrors: CompileError[] = []
  const tokenizer = makeTokenizer(source, tokenizerErrors)
  const parseResult = parse(tokenizer)
  let nextDep = 1
  const references: ReferenceMap = {}
  for (const rawRef of parseResult.references) {
    const expandedRefs = await resolvePathSpec(
      entrypoint,
      workspaceBrowser,
      rawRef,
    )
    const dependencies: DependencySpec[] = []
    for (const expandedRef of expandedRefs) {
      dependencies.push({
        id: expandedRef,
        relativePath: relative(entrypoint, expandedRef),
        suggestedName: `_dep${nextDep++}`,
      })
      await parseRecursive(workspaceParseMap, workspaceBrowser, expandedRef)
    }
    references[rawRef] = dependencies
  }
  workspaceParseMap.set(entrypoint, {
    tree: parseResult.top,
    references,
    tokenizerErrors: tokenizerErrors,
    parserErrors: parseResult.errors,
  })
}
