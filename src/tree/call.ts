import type { tScopedTypeIdentifier, tScopedValueIdentifier, tUnscopedTypeIdentifier, tUnscopedValueIdentifier } from "../tokenizer/token-type";
import type { Atom } from "./atom";
import type { Block } from "./block";
import type { TokenRange } from "./token-range";

export interface Call extends TokenRange {
    type: "call"
    func: Atom<typeof tScopedValueIdentifier | typeof tUnscopedValueIdentifier> | Block
    typeArgs: Atom<typeof tScopedTypeIdentifier | typeof tUnscopedTypeIdentifier>[]
    args: (Atom | Block | Call)[]
}
