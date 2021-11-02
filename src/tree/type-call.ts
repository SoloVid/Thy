import type { tTypeIdentifier, tValueIdentifier } from "../tokenizer/token-type";
import type { Atom } from "./atom";
import type { Block } from "./block";
import type { Call } from "./call";
import type { Identifier } from "./identifier";
import type { TokenRange } from "./token-range";

export interface TypeCall extends TokenRange {
    type: "type-call"
    func: Block | Identifier<typeof tTypeIdentifier | typeof tValueIdentifier>
    args: (Atom | Block | Call | Identifier<typeof tTypeIdentifier | typeof tValueIdentifier>)[]
}
