import { tsCompiler } from "../code-gen/ts-compiler";
import { Compiler } from "../compiler";
import { asyncGlob } from "../utils/async-glob";
import type { CompileOptions } from "./compile-options";
import type { CompileResults, FileCompileResults } from "./compile-results";
import fs from "fs/promises"
import path from "path"
import { convertFromInternalError } from "./compile-error";

export async function compile(options: CompileOptions): Promise<CompileResults> {
    const compiler = pickCompiler(options)
    const patterns = options.srcPatterns ?? ["**/*.thy"]
    const files2Level = await Promise.all(patterns.map(p => asyncGlob(p, { cwd: options.rootDir, root: options.rootDir, nodir: true })))
    const files = files2Level.flat()
    const results = await Promise.all(files.map(f => {
        if (!f.endsWith(".thy")) {
            throw new Error(`File ${f} does not appear to be a .thy file`)
        }
        const srcPath = path.join(options.rootDir, f)
        const srcRelative = path.relative(options.rootDir, srcPath)
        if (srcRelative.startsWith("..") || path.isAbsolute(srcRelative)) {
            throw new Error(`File ${f} is not within rootDir ${options.rootDir}`)
        }
        const outPath = path.join(options.outDir, f).replace(/(\.thy)?$/, ".ts")
        return handleOneFile(compiler, srcPath, outPath)
    }))
    return {
        files: results
    }
}

function pickCompiler(options: CompileOptions): Compiler {
    switch (options.target) {
        case "ts-namespace":
            return tsCompiler
        default:
            throw new Error(`Unsupported target: ${options.target}`)
    }
}

async function handleOneFile(compiler: Compiler, srcPath: string, outPath: string): Promise<FileCompileResults> {
    const input = await fs.readFile(srcPath, 'utf-8')
    const rawResult = compiler.compile(input)
    // console.log(`Would write to ${outPath}:\n${rawResult.output}`)
    await fs.mkdir(path.dirname(outPath), { recursive: true })
    await fs.writeFile(outPath, rawResult.output)
    console.log('format results for ' + srcPath)
    return {
        fileName: path.basename(srcPath),
        filePath: srcPath,
        errors: rawResult.getAllErrors().map(e => convertFromInternalError(e, input))
    }
}
