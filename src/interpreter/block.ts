import type { CompileError } from "common/compile-error"
import { parseAll } from "compiler/parse-workspace"
import { parse } from "parser/parser"
import { makeTokenizer } from "tokenizer"
import type { Block } from "tree"
import { FileBrowseApi } from "utils/fs/file-browse-api"
import { interpretThyAsyncBlock } from "./block-async"
import { interpretThySyncBlock } from "./block-sync"
import { RuntimeFunction, RuntimeReturn, RuntimeValue } from "./dynamic-type"
import { makeInterpreterCompileError } from "./interpreter-error"
import { makeThyResolver } from "./thy-resolver"
import { ThyBlockContext } from "./types"

export type BlockOptions = {
  closure: Record<string, unknown>
  functionName?: string
  stackTracePath: ThyBlockContext["stackTracePath"]
  thyResolutionRelativePath: ThyBlockContext["thyResolutionRelativePath"]
  resolveThy: ThyBlockContext["resolveThy"]
  additionalTraceLinesToHide?: number
}

export type ApiUnknownFunction = (...args: readonly unknown[]) => unknown

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
  const parseMap = new Map([...workspaceParseMap.entries()].map(([path, parseResult]) => [path, parseResult.tree]))
  const resolver = makeThyResolver(parseMap, globals, {
    closure: options.closure ?? {},
    functionName: options.functionName,
    stackTracePath: options.stackTracePath ?? "inline-thy-code",
    additionalTraceLinesToHide: options.additionalTraceLinesToHide ?? 0,
  })
  return resolver.resolveThy(entrypoint, entrypoint)
}

export function interpretThyBlockSource(
  thySource: string,
  options: Partial<BlockOptions> = {},
): ApiUnknownFunction {
  const errors: CompileError[] = []
  const tokenizer = makeTokenizer(thySource, errors)
  const { top } = parse(tokenizer, errors)
  if (errors.length > 0) {
    throw makeInterpreterCompileError(errors[0])
  }
  return interpretThyBlockNode(top, {
    closure: options.closure ?? {},
    functionName: options.functionName,
    stackTracePath: options.stackTracePath ?? "inline-thy-code",
    additionalTraceLinesToHide: options.additionalTraceLinesToHide ?? 0,
    thyResolutionRelativePath: "nope",
    resolveThy: () => {
      throw Error("thy function is not available in a single-file context")
    },
  }) as ApiUnknownFunction
}

export function interpretThyBlockNode(
  block: Block,
  options: BlockOptions,
): (
  ...args: readonly RuntimeValue[]
) => RuntimeReturn {
  const functionName = options.functionName ?? "<anonymous>"

  if (block.isAsync) {
    return interpretThyAsyncBlock(functionName, block, options)
  }

  return interpretThySyncBlock(functionName, block, options)
}
