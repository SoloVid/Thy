import type { CompileError } from "./compile-error"

export interface CompileResults {
    files: readonly FileCompileResults[]
}

export interface FileCompileResults {
    fileName: string
    filePath: string
    errors: readonly CompileError[]
}
