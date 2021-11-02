import type { Token } from "../tokenizer/token";
import type { tTypeIdentifier, tValueIdentifier } from "../tokenizer/token-type";
import type { TokenRange } from "./token-range";

type TypeOrValue = typeof tTypeIdentifier | typeof tValueIdentifier

export interface Identifier<T extends TypeOrValue = TypeOrValue> extends TokenRange {
    type: "identifier"
    scopes: Token<typeof tValueIdentifier>[]
    target: Token<T>
}