import type { TokenType } from './token-type'

export interface OneTokenizer {
    readonly type: TokenType
    match(text: string, offset: number): string | null
}

export interface Token<T extends TokenType = TokenType> {
    type: string//T
    /** Literal text of token from source. */
    text: string
    /** 0-based index of character relative to start of file. */
    offset: number
    /** 0-based index of line in source. */
    line: number
    /** 0-based index of column in source. */
    column: number
}

