import { Token } from "../tokenizer/token";
import type { tBe, tExport, tIs, tPrivate, tScopedValueIdentifier, tTo, tUnscopedValueIdentifier } from "../tokenizer/token-type";
import type { Atom } from "./atom";
import type { Call } from "./call";
import type { TokenRange } from "./token-range";

export interface Assignment extends TokenRange {
    type: "assignment"
    modifier: Token<typeof tExport | typeof tPrivate> | null
    variable: Token<typeof tScopedValueIdentifier | typeof tUnscopedValueIdentifier>
    operator: Token<typeof tIs | typeof tBe | typeof tTo>
    call: Call
}