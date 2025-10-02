import type { CompileError } from "common/compile-error"
import type { Tokenizer } from "tokenizer"
import type { Call } from "tree"
import type { SymbolTable } from "tree/symbol-table"
import { makeSymbolTable } from "tree/symbol-table"
import type { BadParse } from "./error"
import { addNodeError, badParse } from "./error"
import type { TempThatNode } from "./that"
import type { TokenBuffer } from "./token-buffer"
import { makeTokenBuffer } from "./token-buffer"

export interface ParserState {
  readonly buffer: TokenBuffer
  context: ParserContext
  readonly references: readonly string[]

  addError(error: CompileError): void
  addReference(reference: string): void
}

export interface ParserContext {
  symbolTable: SymbolTable

  takeThat(node: TempThatNode): Call | BadParse
}

export function makeParserState(
  tokenizer: Tokenizer,
  errors: CompileError[],
): ParserState {
  const references: string[] = []
  const state: ParserState = {
    buffer: makeTokenBuffer(tokenizer),
    context: {
      symbolTable: makeSymbolTable(),
      takeThat: (thatNode) => {
        addNodeError(
          state,
          thatNode,
          `"that" should not be taken at the top level`,
        )
        return badParse
      },
    },
    references: references,

    addError(e) {
      errors.push(e)
    },
    addReference(reference) {
      references.push(reference)
    },
  }
  return state
}
