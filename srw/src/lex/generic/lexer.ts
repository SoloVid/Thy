import { Token } from "../token.ts"

export interface Lexer {
  getNextToken(): Token | null
}
