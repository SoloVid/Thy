import type { CompileError } from "common/compile-error"
import { parse } from "parser/parser"
import { makeTokenizer } from "tokenizer"
import type { Block } from "tree"
import { interpretThyAsyncBlock } from "./block-async"
import { interpretThySyncBlock } from "./block-sync"
import { RuntimeFunction, RuntimeValue } from "./dynamic-type"
import { makeInterpreterCompileError } from "./interpreter-error"
import { ThyBlockContext } from "./types"

export type BlockOptions = {
  closure: Record<string, unknown>
  functionName?: string
  sourceFile: ThyBlockContext["sourceFile"]
  additionalTraceLinesToHide?: number
}

export type ApiUnknownFunction = (...args: readonly unknown[]) => unknown
type ApiInterpretedBlockWithMeta = {
  interpreted: ApiUnknownFunction
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
    sourceFile: options.sourceFile ?? "inline-thy-code",
    additionalTraceLinesToHide: options.additionalTraceLinesToHide ?? 0,
  }) as ApiInterpretedBlockWithMeta
}

export function interpretThyBlockNode(
  block: Block,
  options: BlockOptions,
): RuntimeFunction {
  return interpretThyBlockNodeWithMeta(block, options)
    .interpreted as RuntimeFunction
}

export function interpretThyBlockNodeWithMeta(
  block: Block,
  options: BlockOptions,
): {
  interpreted: (
    ...args: readonly RuntimeValue[]
  ) => RuntimeValue | undefined | PromiseLike<RuntimeValue | undefined>
} {
  const functionName = options.functionName ?? "<anonymous>"

  if (block.isAsync) {
    return interpretThyAsyncBlock(functionName, block, options)
  }

  return interpretThySyncBlock(functionName, block, options)
}
