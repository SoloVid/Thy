import type { CompileError } from "common/compile-error"
import { parse } from "parser/parser"
import { makeTokenizer } from "tokenizer"
import type { Block } from "tree"
import { interpretThyAsyncBlock } from "./block-async"
import { interpretThySyncBlock } from "./block-sync"
import { RuntimeValue } from "./dynamic-type"
import { makeInterpreterCompileError } from "./interpreter-error"
import { ThyBlockContext } from "./types"
import { FileBrowseApi } from "utils/fs/file-browse-api"
import { parseAll } from "compiler/parse-workspace"
import { makeThyResolver } from "./thy-resolver"

export type BlockOptions = {
  closure: Record<string, unknown>
  functionName?: string
  stackTracePath: ThyBlockContext["stackTracePath"]
  thyResolutionRelativePath: ThyBlockContext["thyResolutionRelativePath"]
  resolveThy: ThyBlockContext["resolveThy"]
  additionalTraceLinesToHide?: number
}

export type ApiUnknownFunction = (...args: readonly unknown[]) => unknown
type ApiInterpretedBlockWithMeta = {
  interpreted: ApiUnknownFunction
  block: Block
}

export async function interpretThyWorkspace(
  workspaceBrowser: FileBrowseApi,
  entrypoint: string,
  options: Partial<BlockOptions> = {},
) {
  const workspaceParseMap = await parseAll(workspaceBrowser, entrypoint)
  const resolver = makeThyResolver(workspaceParseMap, options)
  return resolver.resolveThy(entrypoint, entrypoint)
}

export function interpretThyBlockSource(
  thySource: string,
  options: Partial<BlockOptions> = {},
): ApiUnknownFunction {
  return interpretThyBlockSourceWithMeta(thySource, options).interpreted
}

export function interpretThyBlockSourceWithMeta(
  thySource: string,
  options: Partial<BlockOptions> = {},
): ApiInterpretedBlockWithMeta {
  const errors: CompileError[] = []
  const tokenizer = makeTokenizer(thySource, errors)
  const { top } = parse(tokenizer, errors)
  if (errors.length > 0) {
    throw makeInterpreterCompileError(errors[0])
  }
  return interpretThyBlockNodeWithMeta(top, {
    closure: options.closure ?? {},
    functionName: options.functionName,
    stackTracePath: options.stackTracePath ?? "inline-thy-code",
    additionalTraceLinesToHide: options.additionalTraceLinesToHide ?? 0,
  }) as ApiInterpretedBlockWithMeta
}

export function interpretThyBlockNodeWithMeta(
  block: Block,
  options: BlockOptions,
): {
  block: Block
  interpreted: (
    ...args: readonly RuntimeValue[]
  ) => RuntimeValue | undefined | PromiseLike<RuntimeValue | undefined>
} {
  return {
    block: block,
    interpreted: interpretThyBlockNode(block, options),
  }
}

export function interpretThyBlockNode(
  block: Block,
  options: BlockOptions,
): (
  ...args: readonly RuntimeValue[]
) => RuntimeValue | undefined | PromiseLike<RuntimeValue | undefined> {
  const functionName = options.functionName ?? "<anonymous>"

  if (block.isAsync) {
    return interpretThyAsyncBlock(functionName, block, options)
  }

  return interpretThySyncBlock(functionName, block, options)
}
