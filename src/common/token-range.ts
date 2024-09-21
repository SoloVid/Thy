import type { Token } from "tokenizer"

export interface TokenRange {
  readonly firstToken: Token
  readonly lastToken: Token
}
