import { makeTokenizer } from "tokenizer"
import type { CodeGenerator } from "../code-gen/generator.ts"
import type { CompileError } from "../common/compile-error.ts"
import { parse } from "../parser/parser.ts"
import type { Block } from "../tree/block.ts"

export interface CompileResult {
  output: string
  tree: Readonly<Block>
  tokenizerErrors: readonly CompileError[]
  parserErrors: readonly CompileError[]
  codeGenErrors: readonly CompileError[]

  getAllErrors(): readonly CompileError[]
}

export interface Compiler {
  compile(source: string): CompileResult
}

export function makeCompiler(codeGenerator: CodeGenerator): Compiler {
  return {
    compile(source: string) {
      const tokenizerErrors: CompileError[] = []
      const tokenizer = makeTokenizer(source, tokenizerErrors)
      const parserOutput = parse(tokenizer)
      // console.log(parserOutput)
      // console.log(parserOutput.top.ideas)
      const generatorOutput = codeGenerator(parserOutput.top)
      return {
        output: generatorOutput.output,
        tree: parserOutput.top,
        tokenizerErrors,
        parserErrors: parserOutput.errors,
        codeGenErrors: generatorOutput.errors,
        getAllErrors() {
          return [
            ...tokenizerErrors,
            ...parserOutput.errors,
            ...generatorOutput.errors,
          ]
        },
      }
    },
  }
}
