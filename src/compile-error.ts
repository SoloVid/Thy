import type { Token } from "./tokenizer/token";
import type { TokenRange } from "./tree/token-range";

export interface CompileError {
    message: string
    start: Token
    end: Token
}

export function tokenError(token: Token, message: string): CompileError {
    return {
        message,
        start: token,
        end: token
    }
}

export function tokenRangeError(tokenRange: TokenRange, message: string): CompileError {
    return {
        message,
        start: tokenRange.firstToken,
        end: tokenRange.lastToken
    }
}
