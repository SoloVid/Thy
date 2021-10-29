import type { Token } from "../tokenizer/token";
import type { tConstDeclAssign, tExport, tNoDeclAssign, tPrivate, tScopedValueIdentifier, tUnscopedValueIdentifier, tVarDeclAssign } from "../tokenizer/token-type";
import type { Call } from "./call";
import type { TokenRange } from "./token-range";

export interface Assignment extends TokenRange {
    type: "assignment"
    modifier: Token<typeof tExport | typeof tPrivate> | null
    variable: Token<typeof tScopedValueIdentifier | typeof tUnscopedValueIdentifier>
    operator: Token<typeof tConstDeclAssign | typeof tVarDeclAssign | typeof tNoDeclAssign>
    call: Call
}