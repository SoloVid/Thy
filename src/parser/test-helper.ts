import { tEndStream, TokenType } from "tokenizer/token-type"
import type { CompileError } from "../compile-error"
import type { Token } from "../tokenizer/token"
import type { Tokenizer } from "../tokenizer/tokenizer"
import type { ParserContext, ParserState } from "./parser-state"
import { makeTokenBuffer } from "./token-buffer"

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
  const state: ParserState = {
    buffer: makeTokenBuffer(makeMockTokenizer(tokens)),
    context: {
      // symbolTable: makeSymbolTable(),
      // takeThat: () => thatNotFound,
      // takeBeforeThat: () => thatNotFound,
    } as ParserContext,

    addError(e) {
      errors.push(e)
    },
  }
  return {
    errors,
    state,
  }
}
