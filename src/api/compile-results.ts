import type { CompileError } from "./compile-error"

export interface CompileResults {
    files: readonly FileCompileResults[]
}

export interface FileCompileResults {
    errors: readonly CompileError[]
}
