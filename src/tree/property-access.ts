import type { SaferToken } from "../tokenizer/token"
import type {
  tMemberAccessOperator,
  TokenType,
  tTypeIdentifier,
  tValueIdentifier,
} from "../tokenizer/token-type"
import type { TypeIdentifier, ValueIdentifier } from "./atom"
import { Call } from "./call"
import { ErrorValue } from "./error"
import type { Expression } from "./expression"
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

export function getFundamentalBase(
  propertyAccess: Atom<typeof tValueIdentifier> | GenericCall | PropertyAccess,
): Atom<typeof tValueIdentifier> | GenericCall {
  if (propertyAccess.type === "property-access") {
    return getFundamentalBase(propertyAccess.base)
  }
  return propertyAccess
}

export function getEndOfPropertyAccess(
  propertyAccess:
    | Atom<typeof tValueIdentifier | typeof tTypeIdentifier>
    | GenericCall
    | PropertyAccess,
): SaferToken<typeof tValueIdentifier | typeof tTypeIdentifier> | null {
  if (
    propertyAccess.type === "call" ||
    propertyAccess.type === "await-call" ||
    propertyAccess.type === "given-call"
  ) {
    return null
  }
  if (propertyAccess.type === "property-access") {
    return propertyAccess.property
  }
  return propertyAccess.token
}

export function getEndOfPropertyAccess2<T extends TokenType = never>(
  expression: Expression,
): SaferToken<T> | null {
  if (expression.type === "property-access") {
    return expression.property
  }
  if (expression.type === "atom") {
    return expression.token
  }
  return null
}
