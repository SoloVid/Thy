import type { Token } from "../tokenizer/token";
import type { tTypeIdentifier, tValueIdentifier } from "../tokenizer/token-type";
import type { Atom } from "./atom";
import type { Call } from "./call";
import type { TokenRange } from "./token-range";

type TypeOrValue = typeof tTypeIdentifier | typeof tValueIdentifier

export interface IdentifierDontUse<T extends TypeOrValue = TypeOrValue> extends TokenRange {
    type: "identifier"
    /** Left-to-right qualifiers in the identifier. */
    scopes: (Atom<typeof tValueIdentifier> | Call)[]
    /** The right-most name in the identifier. */
    target: Token<T>
    rawTokens: Token[]
}

// export interface PureIdentifier<T extends TypeOrValue = TypeOrValue> extends Identifier<T> {
//     scopes: (Atom<typeof tValueIdentifier>)[]
// }