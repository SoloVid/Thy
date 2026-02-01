import type { CompileError } from "common/compile-error.ts"
import type { Token, Tokenizer } from "tokenizer"
import { tEndStream, TokenType } from "tokenizer/token-type.ts"
import type { ParserContext, ParserState } from "./parser-state.ts"
import { makeTokenBuffer } from "./token-buffer.ts"

export function makeMockTokenizer(
  tokens: readonly (TokenType | Partial<Token>)[],
): Tokenizer {
  let i = 0
  return {
    getNextToken() {
      if (i >= tokens.length) {
        return { type: tEndStream } as Token
      }
      const t = tokens[i++]
      if (typeof t === "string") {
        return { type: t } as Token
      }
      return t as Token
    },
  }
}

export function makeParserTestFixture(
  tokens: readonly (TokenType | Partial<Token>)[],
) {
  const errors: CompileError[] = []
  const references: string[] = []
  const state: ParserState = {
    buffer: makeTokenBuffer(makeMockTokenizer(tokens)),
    context: {
      // symbolTable: makeSymbolTable(),
      // takeThat: () => thatNotFound,
      // takeBeforeThat: () => thatNotFound,
    } as ParserContext,
    references,

    addError(e) {
      errors.push(e)
    },
    addReference(reference) {
      references.push(reference)
    },
  }
  return {
    errors,
    state,
  }
}
