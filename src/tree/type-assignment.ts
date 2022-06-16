import type { Token } from "../tokenizer/token";
import type { tConstDeclAssign, tExport, tPrivate, tType, tTypeIdentifier } from "../tokenizer/token-type";
import type { Atom } from "./atom";
import type { Call } from "./call";
import type { TokenRange } from "./token-range";
import type { TypeCall } from "./type-call";

export interface TypeAssignment extends TokenRange {
    type: "type-assignment"
    modifier: Token<typeof tExport | typeof tPrivate> | null
    typeToken: Token<typeof tType>
    variable: Atom<typeof tTypeIdentifier>
    operator: Token<typeof tConstDeclAssign>
    call: TypeCall | Call
}