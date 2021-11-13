import type { TokenType } from './token-type'

export interface OneTokenizer {
    readonly type: TokenType
    match(text: string, offset: number): string | null
}

export interface Token<T extends TokenType = TokenType> extends SourcePosition {
    readonly type: string//T
    /** Literal text of token from source. */
    readonly text: string
}

export interface SourcePosition {
    /** 0-based index of character relative to start of file. */
    readonly offset: number
    /** 0-based index of line in source. */
    readonly line: number
    /** 0-based index of column in source. */
    readonly column: number
}
