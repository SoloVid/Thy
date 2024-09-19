import type { SaferToken, Token } from "./token"
import type { TokenType } from "./token-type"
import type { TokenizerState } from "./tokenizer-state"

export function makeTokenHere(
  state: TokenizerState,
  type: TokenType,
  text: string,
): SaferToken<TokenType> {
  const token = {
    type: type,
    offset: state.offset,
    line: state.line,
    column: state.column,
    text,
  }
  state.advance(type, text.length)
  return token as SaferToken<TokenType>
}
