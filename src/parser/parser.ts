import type { CompileError } from "../compile-error"
import type { Tokenizer } from "../tokenizer/tokenizer"
import type { Block } from "../tree/block"
import { makeSymbolTable } from "../tree/symbol-table"
import { addNodeError } from "./error"
import { parseBlockInner } from "./parse-block"
import type { ParserState } from "./parser-state"
import { makeTokenBuffer } from "./token-buffer"

export interface ParserOutput {
  top: Block
  errors: CompileError[]
}

export function parse(
  tokenizer: Tokenizer,
  errors: CompileError[] = [],
): ParserOutput {
  const state: ParserState = {
    buffer: makeTokenBuffer(tokenizer),
    context: {
      symbolTable: makeSymbolTable(),
      takeThat: (thatNode) =>
        addNodeError(
          state,
          thatNode,
          `"that" should not be taken at the top level`,
        ),
    },

    addError(e) {
      errors.push(e)
    },
  }
  return {
    top: parseBlockInner(state),
    errors: errors,
  }
}
