import { ErrorValue } from "tree/error"
import { tokenError } from "../compile-error"
import type { SaferToken, Token } from "../tokenizer/token"
import {
  tMemberAccessOperator,
  tThat,
  tTypeIdentifier,
  tValueIdentifier,
} from "../tokenizer/token-type"
import type {
  TypeIdentifier,
  ValueIdentifier,
  ValuePropertyAccess,
} from "../tree"
import { addNodeError, addTokenError } from "./error"
import type { ParserState } from "./parser-state"
import {
  IndeterminateTypePropertyAccess,
  IndeterminateValuePropertyAccess,
  TempThatNode,
  UnsafeIndeterminateValuePropertyAccess,
} from "./that"

export type IndeterminateNamedValueExpression =
  | ValueIdentifier
  | IndeterminateValuePropertyAccess
  | TempThatNode
  | ErrorValue

export function parseIndeterminateNamedValueExpression(
  state: ParserState,
): IndeterminateNamedValueExpression {
  const expression = parseAnyIndeterminateNamedExpression(state)
  if (
    expression.type === "type-identifier" ||
    expression.type === "indeterminate-type-property-access"
  ) {
    return addNodeError(state, expression, `Unexpected type expression`)
  }
  return expression
}

export function parseIndeterminateAssignableNamedValueExpression(
  state: ParserState,
): ValueIdentifier | IndeterminateValuePropertyAccess | ErrorValue {
  const expression = parseIndeterminateNamedValueExpression(state)
  if (expression.type === "that") {
    return addNodeError(state, expression, `Cannot assign to that`)
  }
  return expression
}

type IdentifierToken = Token<typeof tTypeIdentifier | typeof tValueIdentifier>

function makeNamedNode(
  token: SaferToken<
    typeof tThat | typeof tTypeIdentifier | typeof tValueIdentifier
  >,
): TempThatNode | TypeIdentifier | ValueIdentifier {
  if (token.type === tThat) {
    return {
      type: "that",
      token: token as SaferToken<typeof tThat>,
    }
  }
  if (token.type === tValueIdentifier) {
    return {
      type: "value-identifier",
      token: token as SaferToken<typeof tValueIdentifier>,
    }
  }
  return {
    type: "type-identifier",
    token: token as SaferToken<typeof tTypeIdentifier>,
  }
}

export function parseAnyIndeterminateNamedExpression(
  state: ParserState,
):
  | TempThatNode
  | TypeIdentifier
  | IndeterminateTypePropertyAccess
  | ValueIdentifier
  | IndeterminateValuePropertyAccess
  | ErrorValue {
  let baseToken = state.buffer.consumeToken() as SaferToken<
    typeof tThat | typeof tTypeIdentifier | typeof tValueIdentifier
  >
  if (
    baseToken.type !== tThat &&
    baseToken.type !== tTypeIdentifier &&
    baseToken.type !== tValueIdentifier
  ) {
    return addTokenError(
      state,
      baseToken,
      `Expected named expression, got ${baseToken.type}: ${baseToken.text}`,
    )
  }
  // assert(baseToken.type === tThat || baseToken.type == tTypeIdentifier || baseToken.type === tValueIdentifier, `parseAnyNamedExpression() should only be called when next token is "that" or an identifier (got ${baseToken.type}: ${baseToken.text})`)

  const propertiesAccessed: SaferToken<
    typeof tTypeIdentifier | typeof tValueIdentifier
  >[] = []
  const memberAccessOperatorTokens: Token<typeof tMemberAccessOperator>[] = []
  let nextToken = state.buffer.peekToken()
  while (nextToken.type === tMemberAccessOperator) {
    const maoToken = state.buffer.consumeToken() as Token<
      typeof tMemberAccessOperator
    >
    memberAccessOperatorTokens.push(maoToken)
    const nextNameToken = state.buffer.peekToken()
    if (![tTypeIdentifier, tValueIdentifier].includes(nextNameToken.type)) {
      state.addError(
        tokenError(
          maoToken,
          `Dangling member access operator (next token ${nextNameToken.type}: ${nextNameToken.text})`,
        ),
      )
      break
    } else {
      const nextIdentifierToken = state.buffer.consumeToken() as IdentifierToken
      propertiesAccessed.push(nextIdentifierToken)
      nextToken = state.buffer.peekToken()
    }
  }

  if (propertiesAccessed.length === 0) {
    return makeNamedNode(baseToken)
  }

  const finalToken = propertiesAccessed[propertiesAccessed.length - 1]

  if (finalToken.type === tTypeIdentifier) {
    return {
      type: "indeterminate-type-property-access",
      base: makeNamedNode(baseToken),
      propertyAccesses: propertiesAccessed.map((p, i) => ({
        memberAccessOperatorToken: memberAccessOperatorTokens[i],
        propertyToken: p,
      })),
      firstToken: baseToken,
      lastToken: finalToken,
    }
  }

  const unsafeValuePropertyAccess: UnsafeIndeterminateValuePropertyAccess = {
    base: makeNamedNode(baseToken) as TempThatNode | ValueIdentifier,
    propertyAccesses: propertiesAccessed.map((p, i) => ({
      memberAccessOperatorToken: memberAccessOperatorTokens[i],
      propertyToken: p as SaferToken<typeof tValueIdentifier>,
    })),
    firstToken: baseToken,
    lastToken: finalToken,
  }
  return validateValuePropertyAccess(state, unsafeValuePropertyAccess)
}

function validateValuePropertyAccess(
  state: ParserState,
  node: UnsafeIndeterminateValuePropertyAccess,
): IndeterminateValuePropertyAccess | ValueIdentifier {
  let validSoFar = true
  type ValidValuePropertyAccess =
    ValuePropertyAccess["propertyAccesses"][number]
  const finalPropertyAccess = node.propertyAccesses[
    node.propertyAccesses.length - 1
  ] as ValidValuePropertyAccess
  const validIntermediatePropertyAccesses: ValidValuePropertyAccess[] = []
  for (let i = node.propertyAccesses.length - 2; i >= 0; i--) {
    const pa = node.propertyAccesses[i]
    const s = pa.propertyToken
    if (s.type !== tValueIdentifier) {
      state.addError(
        tokenError(
          s,
          `"${s.text}" is a type and cannot be dereferenced (.) for a value`,
        ),
      )
      validSoFar = false
    } else if (validSoFar) {
      validIntermediatePropertyAccesses.unshift(pa as ValidValuePropertyAccess)
    }
  }
  if (node.base.type === "type-identifier") {
    state.addError(
      tokenError(
        node.base.token,
        `"${node.base.token.text}" is a type and cannot be dereferenced (.) for a value`,
      ),
    )
    if (validIntermediatePropertyAccesses.length === 0) {
      return {
        type: "value-identifier",
        token: finalPropertyAccess.propertyToken,
      }
    }
    return {
      type: "indeterminate-value-property-access",
      base: {
        type: "value-identifier",
        token: validIntermediatePropertyAccesses[0].propertyToken,
      },
      propertyAccesses: [
        ...validIntermediatePropertyAccesses.slice(1),
        finalPropertyAccess,
      ],
      firstToken: node.firstToken,
      lastToken: node.lastToken,
    }
  }
  return {
    type: "indeterminate-value-property-access",
    base: node.base,
    propertyAccesses: [
      ...validIntermediatePropertyAccesses,
      finalPropertyAccess,
    ],
    firstToken: node.firstToken,
    lastToken: node.lastToken,
  }
}
