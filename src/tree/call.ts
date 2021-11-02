import type { tTypeIdentifier, tValueIdentifier } from "../tokenizer/token-type";
import type { Atom } from "./atom";
import type { Block } from "./block";
import type { Identifier } from "./identifier";
import type { TokenRange } from "./token-range";

export interface Call extends TokenRange {
    type: "call"
    func: Atom | Block | Identifier<typeof tValueIdentifier>
    typeArgs: Identifier<typeof tTypeIdentifier>[]
    args: (Atom | Block | Call | Identifier<typeof tValueIdentifier>)[]
}
