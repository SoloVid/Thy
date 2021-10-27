import { tScopedTypeIdentifier, tUnscopedTypeIdentifier } from "../tokenizer/token-type";
import type { Atom } from "./atom";
import type { Block } from "./block";
import type { TokenRange } from "./token-range";

export interface TypeCall extends TokenRange {
    type: "type-call"
    func: Atom<typeof tScopedTypeIdentifier | typeof tUnscopedTypeIdentifier>
    args: (Atom | Block)[]
}
