import type { Token } from "../tokenizer/token";
import { tExport, tConstDeclAssign, tPrivate, tUnscopedTypeIdentifier } from "../tokenizer/token-type";
import type { Call } from "./call";
import type { TokenRange } from "./token-range";
import type { TypeCall } from "./type-call";

export interface TypeAssignment extends TokenRange {
    type: "type-assignment"
    modifier: Token<typeof tExport | typeof tPrivate> | null
    variable: Token<typeof tUnscopedTypeIdentifier>
    operator: Token<typeof tConstDeclAssign>
    call: TypeCall | Call
}