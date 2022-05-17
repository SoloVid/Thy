import type { CompileError } from "../compile-error";
import type { Token } from "../tokenizer/token";
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

    takeThat(thatToken: Token): Call | typeof thatNotFound | typeof thatAlreadyUsed
    takeBeforeThat(beforeThatToken: Token): Call | typeof thatNotFound | typeof thatAlreadyUsed
}

export const thatNotFound = Symbol("thatNotFound")
export const thatAlreadyUsed = Symbol("thatAlreadyUsed")
