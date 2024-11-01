import type { TokenRange } from "common/token-range"
import type { Token } from "tokenizer"
import type {
  tMemberAccessOperator,
  tThat,
  tTypeIdentifier,
  tValueIdentifier,
} from "tokenizer/token-type"
import type { Call } from "./call"
import type { TypeIdentifier, ValueIdentifier } from "./term"

export interface ValuePropertyAccess extends TokenRange {
  readonly type: "value-property-access"
  readonly base: Call | ValueIdentifier
  readonly baseToken: Token<typeof tValueIdentifier | typeof tThat>
  readonly propertyAccesses: readonly {
    readonly memberAccessOperatorToken: Token<typeof tMemberAccessOperator>
    readonly propertyToken: Token<typeof tValueIdentifier>
  }[]
}

export type SimpleValuePropertyAccess = ValuePropertyAccess & {
  readonly base: ValueIdentifier
}

export interface TypePropertyAccess extends TokenRange {
  readonly type: "type-property-access"
  readonly base: Call | TypeIdentifier | ValueIdentifier
  readonly baseToken: Token<
    typeof tTypeIdentifier | typeof tValueIdentifier | typeof tThat
  >
  readonly propertyAccesses: readonly {
    readonly memberAccessOperatorToken: Token<typeof tMemberAccessOperator>
    readonly propertyToken: Token<
      typeof tTypeIdentifier | typeof tValueIdentifier
    >
  }[]
}

export type SimpleTypePropertyAccess = TypePropertyAccess & {
  readonly base: TypeIdentifier | ValueIdentifier
}
