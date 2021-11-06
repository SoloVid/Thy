import fs from "fs/promises"
import path from "path"
import { generateTs } from "../../../code-gen/generate-ts"
import type { CompileError } from "../../../compile-error"
import { parse } from "../../../parser/parser"
import { makeTokenizer } from "../../../tokenizer/tokenizer"

export async function compileAndVerifyOutput(libDir: string, inputFile: string, expectedOutputFile: string) {
    const thySource = await readFile(libDir, inputFile)
    const tsSource = await readFile(libDir, expectedOutputFile)
    const compileResult = await compileSource(thySource)
    expect(compileResult.output).toBe(tsSource)
    expect(compileResult.errors).toEqual([])
}

async function readFile(libDir: string, relativePath: string): Promise<string> {
    const srcPath = pathInSrc(path.join(libDir, relativePath))
    const contentsBuffer = await fs.readFile(srcPath)
    return contentsBuffer.toString().replace("\r\n", "\n")
}

function pathInSrc(libPath: string): string {
    const absLibPath = path.resolve(libPath)
    const searchFor = "lib"
    const replaceWith = "src"
    const libIndex = absLibPath.lastIndexOf(searchFor)
    return absLibPath.substr(0, libIndex) + replaceWith + absLibPath.substr(libIndex + searchFor.length)
}

export interface CompileResult {
    output: string
    errors: CompileError[]
}

async function compileSource(thySource: string): Promise<CompileResult> {
    const tokenizer = makeTokenizer(thySource)
    const parserOutput = parse(tokenizer)
    const tree = parserOutput.top
    const ts = generateTs(tree)
    return {
        output: ts,
        errors: parserOutput.errors
    }
}
