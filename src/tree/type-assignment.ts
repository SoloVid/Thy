import type { Token } from "../tokenizer/token";
import { tExport, tIs, tPrivate, tUnscopedTypeIdentifier } from "../tokenizer/token-type";
import type { Call } from "./call";
import type { TokenRange } from "./token-range";
import type { TypeCall } from "./type-call";

export interface TypeAssignment extends TokenRange {
    type: "assignment"
    modifier: Token<typeof tExport | typeof tPrivate> | null
    variable: Token<typeof tUnscopedTypeIdentifier>
    operator: Token<typeof tIs>
    call: TypeCall | Call
}