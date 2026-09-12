export type Token<TokenKind extends (string | null) = string> = {
  kind: TokenKind
  offset: number
  length: number
}
