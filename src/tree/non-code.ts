import type { Token } from "../tokenizer/token";

export interface NonCode {
    type: "non-code"
    token: Token
}