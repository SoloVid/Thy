import type { Token } from "./token"
import type { TokenType } from "./token-type"
import type { TokenizerState } from "./tokenizer-state"

export function makeTokenHere(
  state: TokenizerState,
  type: TokenType,
  text: string,
): Token<TokenType> {
  const token = {
    type: type,
    offset: state.offset,
    line: state.line,
    column: state.column,
    text,
  }
  state.advance(type, text.length)
  return token as Token<TokenType>
}
