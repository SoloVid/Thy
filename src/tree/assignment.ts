import type { Token } from "../tokenizer/token";
import type { tConstDeclAssign, tExport, tNoDeclAssign, tPrivate, tValueIdentifier, tVarDeclAssign } from "../tokenizer/token-type";
import type { Atom } from "./atom";
import type { Call } from "./call";
import type { PropertyAccess } from "./property-access";
import type { TokenRange } from "./token-range";

export interface Assignment extends TokenRange {
    type: "assignment"
    modifier: Token<typeof tExport | typeof tPrivate> | null
    variable: Atom | PropertyAccess<typeof tValueIdentifier>
    operator: Token<typeof tConstDeclAssign | typeof tVarDeclAssign | typeof tNoDeclAssign>
    call: Call
}