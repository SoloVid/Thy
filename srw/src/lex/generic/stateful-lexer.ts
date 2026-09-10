import { Lexer } from "./lexer.ts"
import { Muncher } from "./munch/muncher.ts"
import { LexState } from "./state.ts"

export function makeStatefulLexer<TokenKind extends string = string>(
  text: string,
  muncher: Muncher<TokenKind>,
): Lexer<TokenKind> {
  const state: LexState = {
    text: text,
    offset: 0,
  }

  return {
    getNextToken: () => {
      return muncher(state)
    },
  }
}
