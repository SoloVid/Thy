import { Lexer } from "./lexer.ts"
import { Muncher } from "./muncher.ts"
import { LexState } from "./state.ts"

export function makeStatefulLexer(
  text: string,
  muncher: Muncher,
): Lexer {
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
