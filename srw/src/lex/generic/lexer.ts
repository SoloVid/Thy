import { Token } from "./token.ts"

export interface Lexer<TokenKind extends string = string> {
  getNextToken(): Token<TokenKind> | null
}
