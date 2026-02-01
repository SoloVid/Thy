import type { CompileError } from "common/compile-error.ts"
import { parse } from "parser/parser.ts"
import { makeTokenizer } from "tokenizer"
import type { Block } from "tree"
import { interpretThyAsyncBlock } from "./block-async.ts"
import { interpretThySyncBlock } from "./block-sync.ts"
import { RuntimeFunction, RuntimeReturn, RuntimeValue } from "./dynamic-type.ts"
import { makeInterpreterCompileError } from "./interpreter-error.ts"
import { BlockOptions } from "./block-options.ts"

export type ApiUnknownFunction = (...args: readonly unknown[]) => unknown

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
): (...args: readonly RuntimeValue[]) => RuntimeReturn {
  const functionName = options.functionName ?? "<anonymous>"

  if (block.isAsync) {
    return interpretThyAsyncBlock(functionName, block, options)
  }

  return interpretThySyncBlock(functionName, block, options)
}
