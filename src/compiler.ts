import type { CodeGenerator } from "./code-gen/generator";
import type { CompileError } from "./compile-error";
import { parse } from "./parser/parser";
import type { TokenizerFactory } from "./tokenizer/tokenizer";
import type { Block } from "./tree/block";

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

export function makeCompiler(tokenizerFactory: TokenizerFactory, codeGenerator: CodeGenerator): Compiler {
    return {
        compile(source: string) {
            const tokenizerErrors: CompileError[] = []
            const tokenizer = tokenizerFactory(source, tokenizerErrors)
            const parserOutput = parse(tokenizer)
            const generatorOutput = codeGenerator(parserOutput.top)
            return {
                output: generatorOutput.output,
                tree: parserOutput.top,
                tokenizerErrors,
                parserErrors: parserOutput.errors,
                codeGenErrors: generatorOutput.errors,
                getAllErrors() {
                    return [...tokenizerErrors, ...parserOutput.errors, ...generatorOutput.errors]
                }
            }
        }
    }
}
