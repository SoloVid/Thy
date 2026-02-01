import type { CompileError } from "common/compile-error.ts"
import type { Tokenizer } from "tokenizer"
import type { Call } from "tree"
import type { SymbolTable } from "tree/symbol-table.ts"
import { makeSymbolTable } from "tree/symbol-table.ts"
import type { BadParse } from "./error.ts"
import { addNodeError, badParse } from "./error.ts"
import type { TempThatNode } from "./that.ts"
import type { TokenBuffer } from "./token-buffer.ts"
import { makeTokenBuffer } from "./token-buffer.ts"

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
