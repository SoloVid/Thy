import fs from "fs/promises"
import path from "path"
import { expect } from "expect"
import type { CompileError } from "../../../compile-error"
import type { Compiler } from "../../../compiler"

export async function compileAndVerifyOutput(compiler: Compiler, libDir: string, inputFile: string, expectedOutputFile: string) {
    const thySource = await readFile(libDir, inputFile)
    const tsSource = await readFile(libDir, expectedOutputFile)
    const compileResult = await compileSource(compiler, thySource)
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
    const searchFor = "lib"
    const replaceWith = "src"
    const libRootPath = path.resolve(path.join(__dirname, "..", "..", ".."))
    const libIndex = libRootPath.lastIndexOf(searchFor)
    let srcRootPath = libRootPath
    if (libIndex >= 0) {
        srcRootPath = libRootPath.substring(0, libIndex) + replaceWith + libRootPath.substring(libIndex + searchFor.length)
    }
    const absLibPath = path.resolve(libPath)
    return absLibPath.replace(libRootPath, srcRootPath)
}

export interface CompileResult {
    output: string
    errors: readonly CompileError[]
}

async function compileSource(compiler: Compiler, thySource: string): Promise<CompileResult> {
    const compilerResult = compiler.compile(thySource)
    return {
        output: compilerResult.output,
        errors: compilerResult.getAllErrors()
    }
}
