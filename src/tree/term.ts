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

export interface AwaitTerm {
  readonly type: "await-term"
  readonly token: Token<typeof tAwait>
}

export interface GivenTerm {
  readonly type: "given-term"
  readonly token: Token<typeof tGiven>
}

export interface ReturnTerm {
  readonly type: "return-term"
  readonly token: Token<typeof tReturn>
}

export interface TypeGivenTerm {
  readonly type: "type-given-term"
  readonly token: Token<typeof tTypeGiven>
}
