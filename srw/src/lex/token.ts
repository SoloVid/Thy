import { TokenKind } from "./token-kind.ts"

export type Token<Kind extends TokenKind = TokenKind> = {
  kind: Kind
  offset: number
  length: number
}
