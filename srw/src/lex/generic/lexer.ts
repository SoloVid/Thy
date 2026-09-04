import { Token } from "../token.ts"
import { LexState } from "./state.ts"

export interface Lexer {
  getNextToken(): Token | null
}
