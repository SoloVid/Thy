import type { TokenType } from './token-type'

export interface OneTokenizer {
    readonly type: TokenType
    match(text: string, offset: number): string | null
}

export interface Token {
    type: TokenType
    text: string
    offset: number
    // line: number
    // column: number
}

