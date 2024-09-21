import type { Token } from "../tokenizer/token"
import type {
  tMemberAccessOperator,
  tThat,
  tTypeIdentifier,
  tValueIdentifier,
} from "../tokenizer/token-type"
import type { TypeIdentifier, ValueIdentifier } from "./atom"
import { Call } from "./call"
import type { TokenRange } from "./token-range"

export interface ValuePropertyAccess extends TokenRange {
  readonly type: "value-property-access"
  readonly base: Call | ValueIdentifier
  readonly baseToken: Token<typeof tValueIdentifier | typeof tThat>
  readonly propertyAccesses: readonly {
    readonly memberAccessOperatorToken: Token<typeof tMemberAccessOperator>
    readonly propertyToken: Token<typeof tValueIdentifier>
  }[]
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
