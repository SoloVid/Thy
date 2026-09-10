
export type Token<TokenKind extends string = string> = {
  kind: TokenKind
  offset: number
  length: number
}
