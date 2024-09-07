import type { Token } from "./token"
import type { TokenType } from "./token-type"
import type { TokenizerState } from "./tokenizer-state"

export function startTokenHere(
  state: TokenizerState,
  type: TokenType,
): Omit<Token, "text"> {
  return {
    type: type,
    offset: state.offset,
    line: state.line,
    column: state.column,
  }
}

export function makeTokenHere(
  state: TokenizerState,
  type: TokenType,
  text: string,
) {
  const partial = startTokenHere(state, type)
  state.advance(type, text.length)
  return {
    ...partial,
    text,
  }
}
