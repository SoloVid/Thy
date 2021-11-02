import type { CompileError } from "../compile-error";
import type { Tokenizer } from "../tokenizer/tokenizer";
import type { Block } from "../tree/block";
import { makeSymbolTable } from "../tree/symbol-table";
import { parseBlock } from "./parse-block";
import type { ParserState } from "./parser-state";
import { makeTokenBuffer } from "./token-buffer";

export interface ParserOutput {
    top: Block
    errors: CompileError[]
}

export function parse(tokenizer: Tokenizer): ParserOutput {
    const errors: CompileError[] = []
    const state: ParserState = {
        buffer: makeTokenBuffer(tokenizer),
        context: {
            symbolTable: makeSymbolTable(),
            takeThat: () => null,
            takeBeforeThat: () => null
        },

        addError(e) {
            errors.push(e)
        }
    }
    return {
        top: parseBlock(state),
        errors: errors
    }
}