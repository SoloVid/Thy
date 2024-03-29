import type { Token } from "../tokenizer/token";
import type { tMemberAccessOperator, tTypeIdentifier, tValueIdentifier } from "../tokenizer/token-type";
import type { Atom } from "./atom";
import type { Call } from "./call";
import type { Expression } from "./expression";
import type { TokenRange } from "./token-range";

type TypeOrValue = typeof tTypeIdentifier | typeof tValueIdentifier

export interface PropertyAccess<CallPossibleAsBaseOrNever extends Call = Call, T extends TypeOrValue = TypeOrValue>
    extends TokenRange
{
    type: "property-access"
    base: Atom | Call | PropertyAccess<CallPossibleAsBaseOrNever, typeof tValueIdentifier>
    memberAccessOperatorToken: Token<typeof tMemberAccessOperator>
    property: Token<T>
}

export function getFundamentalBase(propertyAccess: Atom | Call | PropertyAccess): Atom | Call {
    if (propertyAccess.type === 'property-access') {
        return getFundamentalBase(propertyAccess.base)
    }
    return propertyAccess
}

export function getEndOfPropertyAccess(propertyAccess: Atom | Call | PropertyAccess): Token | null {
    if (propertyAccess.type === 'call') {
        return null
    }
    if (propertyAccess.type === 'property-access') {
        return propertyAccess.property
    }
    return propertyAccess.token
}

export function getEndOfPropertyAccess2(expression: Expression): Token | null {
    if (expression.type === 'property-access') {
        return expression.property
    }
    if (expression.type === 'atom') {
        return expression.token
    }
    return null
}
