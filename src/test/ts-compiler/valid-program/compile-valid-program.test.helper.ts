import fs from "fs/promises"
import path from "path"
import { tsCompiler } from "../../../code-gen/ts-compiler"
import type { CompileError } from "../../../compile-error"

export async function compileAndVerifyOutput(libDir: string, inputFile: string, expectedOutputFile: string) {
    const thySource = await readFile(libDir, inputFile)
    const tsSource = await readFile(libDir, expectedOutputFile)
    const compileResult = await compileSource(thySource)
    // console.log(compileResult.output);
    expect(compileResult.output).toBe(tsSource)
    expect(compileResult.errors).toEqual([])
}

async function readFile(libDir: string, relativePath: string): Promise<string> {
    const srcPath = pathInSrc(path.join(libDir, relativePath))
    const contentsBuffer = await fs.readFile(srcPath)
    return contentsBuffer.toString().replace(/\r\n/g, "\n")
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
    errors: readonly CompileError[]
}

async function compileSource(thySource: string): Promise<CompileResult> {
    const compilerResult = tsCompiler.compile(thySource)
    return {
        output: compilerResult.output,
        errors: compilerResult.getAllErrors()
    }
}
