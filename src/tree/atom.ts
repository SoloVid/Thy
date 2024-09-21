import type { Token } from "tokenizer"
import type {
  tAwait,
  tGiven,
  tNumberLiteral,
  tReturn,
  tTypeGiven,
  tTypeIdentifier,
  tValueIdentifier,
} from "tokenizer/token-type"

export interface NumberLiteral {
  readonly type: "number-literal"
  readonly token: Token<typeof tNumberLiteral>
}

export interface TypeIdentifier {
  readonly type: "type-identifier"
  readonly token: Token<typeof tTypeIdentifier>
}

export interface ValueIdentifier {
  readonly type: "value-identifier"
  readonly token: Token<typeof tValueIdentifier>
}

export interface AwaitAtom {
  readonly type: "await-atom"
  readonly token: Token<typeof tAwait>
}

export interface GivenAtom {
  readonly type: "given-atom"
  readonly token: Token<typeof tGiven>
}

export interface ReturnAtom {
  readonly type: "return-atom"
  readonly token: Token<typeof tReturn>
}

export interface TypeGivenAtom {
  readonly type: "type-given-atom"
  readonly token: Token<typeof tTypeGiven>
}
