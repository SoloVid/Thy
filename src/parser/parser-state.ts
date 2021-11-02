import type { CompileError } from "../compile-error";
import type { Call } from "../tree/call";
import type { SymbolTable } from "../tree/symbol-table";
import type { TokenBuffer } from "./token-buffer";

export interface ParserState {
    readonly buffer: TokenBuffer
    context: ParserContext

    addError(error: CompileError): void
}

export interface ParserContext {
    symbolTable: SymbolTable

    takeThat(): Call | null
    takeBeforeThat(): Call | null
}
