import type { TokenType } from "./token-type"

export interface OneTokenizer {
  readonly type: TokenType
  match(text: string, offset: number): string | null
}

export type Token<T extends TokenType = TokenType> = SourcePosition &
  // Forcing distribution here aids TypeScript discriminated unions.
  (T extends TokenType
    ? {
        readonly type: T
        /** Literal text of token from source. */
        readonly text: string
      }
    : never)

export type SaferToken<T extends TokenType = never> = Token<T>

export interface SourcePosition {
  /** 0-based index of character relative to start of file. */
  readonly offset: number
  /** 0-based index of line in source. */
  readonly line: number
  /** 0-based index of column in source. */
  readonly column: number
}
