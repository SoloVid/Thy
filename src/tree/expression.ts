import type { tTypeIdentifier, tValueIdentifier } from "../tokenizer/token-type";
import type { Atom } from "./atom";
import type { Block } from "./block";
import type { Call } from "./call";
import type { PropertyAccess } from "./property-access";

export type Expression = Atom | Block | Call | PropertyAccess<Call, typeof tValueIdentifier>;

export type TypeExpression = Atom<typeof tTypeIdentifier> | PropertyAccess<Call, typeof tTypeIdentifier>;
