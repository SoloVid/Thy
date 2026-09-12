import { Token } from "./token.ts"

export type LexResult<TokenKind extends string = string> = {
  tokens: Token<TokenKind | null>[]
}
