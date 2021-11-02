import type { Token } from "../tokenizer/token";
import type { tYield } from "../tokenizer/token-type";
import type { Call } from "./call";
import type { TokenRange } from "./token-range";

export interface YieldCall extends TokenRange {
    type: "yield-call"
    yieldToken: Token<typeof tYield>
    call: Call
}
