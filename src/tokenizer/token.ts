import type { SourcePosition } from "common"
import type { TokenType } from "./token-type.ts"

export interface OneTokenizer {
  readonly type: TokenType
  match(text: string, offset: number): string | null
}

export type Token<T extends TokenType = TokenType> =
  & SourcePosition
  & // Forcing distribution here aids TypeScript discriminated unions.
  (T extends TokenType ? {
      readonly type: T
      /** Literal text of token from source. */
      readonly text: string
    }
    : never)
