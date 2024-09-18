import type { SaferToken } from "../tokenizer/token"
import type {
  tMemberAccessOperator,
  tTypeIdentifier,
  tValueIdentifier,
} from "../tokenizer/token-type"
import type { TypeIdentifier, ValueIdentifier } from "./atom"
import { Call } from "./call"
import { ErrorValue } from "./error"
import type { TokenRange } from "./token-range"

export interface ValuePropertyAccess extends TokenRange {
  type: "value-property-access"
  base: Call | ValueIdentifier | ErrorValue
  propertyAccesses: readonly {
    memberAccessOperatorToken: SaferToken<typeof tMemberAccessOperator>
    propertyToken: SaferToken<typeof tValueIdentifier>
  }[]
}

export interface TypePropertyAccess extends TokenRange {
  type: "type-property-access"
  base: Call | TypeIdentifier | ValueIdentifier | ErrorValue
  propertyAccesses: readonly {
    memberAccessOperatorToken: SaferToken<typeof tMemberAccessOperator>
    propertyToken: SaferToken<typeof tTypeIdentifier | typeof tValueIdentifier>
  }[]
}
