import type { Call } from "./call";
import type { TokenRange } from "./token-range";

export interface YieldCall extends TokenRange {
    type: "yield-call"
    call: Call
}
