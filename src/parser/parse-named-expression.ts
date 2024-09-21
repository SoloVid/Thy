import { tokenError } from "common/compile-error"
import type { Token } from "tokenizer"
import {
  tMemberAccessOperator,
  tThat,
  tTypeIdentifier,
  tValueIdentifier,
} from "tokenizer/token-type"
import type { TypeIdentifier, ValueIdentifier, ValuePropertyAccess } from "tree"
import { addNodeError, addTokenError, badParse, BadParse } from "./error"
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

export function parseIndeterminateNamedValueExpression(
  state: ParserState,
): IndeterminateNamedValueExpression | BadParse {
  const expression = parseAnyIndeterminateNamedExpression(state)
  if (expression === badParse) return badParse
  if (
    expression.type === "type-identifier" ||
    expression.type === "indeterminate-type-property-access"
  ) {
    addNodeError(state, expression, `Unexpected type expression`)
    return badParse
  }
  return expression
}

type NamedNode<
  T extends typeof tThat | typeof tTypeIdentifier | typeof tValueIdentifier,
> = T extends typeof tThat
  ? TempThatNode
  : T extends typeof tTypeIdentifier
    ? TypeIdentifier
    : T extends typeof tValueIdentifier
      ? ValueIdentifier
      : never

function makeNamedNode<
  T extends typeof tThat | typeof tTypeIdentifier | typeof tValueIdentifier,
>(token: Token<T>): NamedNode<T> {
  if (token.type === tThat) {
    return {
      type: "that",
      token: token,
    } as NamedNode<T>
  }
  if (token.type === tValueIdentifier) {
    return {
      type: "value-identifier",
      token: token,
    } as NamedNode<T>
  }
  return {
    type: "type-identifier",
    token: token,
  } as NamedNode<T>
}

export function parseAnyIndeterminateNamedExpression(
  state: ParserState,
):
  | TempThatNode
  | TypeIdentifier
  | IndeterminateTypePropertyAccess
  | ValueIdentifier
  | IndeterminateValuePropertyAccess
  | BadParse {
  let baseToken = state.buffer.consumeToken()
  if (
    baseToken.type !== tThat &&
    baseToken.type !== tTypeIdentifier &&
    baseToken.type !== tValueIdentifier
  ) {
    addTokenError(
      state,
      baseToken,
      `Expected named expression, got ${baseToken.type}: ${baseToken.text}`,
    )
    return badParse
  }

  const propertiesAccessed: Token<
    typeof tTypeIdentifier | typeof tValueIdentifier
  >[] = []
  const memberAccessOperatorTokens: Token<typeof tMemberAccessOperator>[] = []
  let nextToken = state.buffer.peekToken()
  while (nextToken.type === tMemberAccessOperator) {
    const maoToken = nextToken
    state.buffer.consumeToken()
    memberAccessOperatorTokens.push(maoToken)
    const nextNameToken = state.buffer.peekToken()
    if (
      nextNameToken.type !== tTypeIdentifier &&
      nextNameToken.type !== tValueIdentifier
    ) {
      state.addError(
        tokenError(
          maoToken,
          `Dangling member access operator (next token ${nextNameToken.type}: ${nextNameToken.text})`,
        ),
      )
      break
    } else {
      const nextIdentifierToken = nextNameToken
      state.buffer.consumeToken()
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
      baseToken,
      propertyAccesses: propertiesAccessed.map((p, i) => ({
        memberAccessOperatorToken: memberAccessOperatorTokens[i],
        propertyToken: p,
      })),
      firstToken: baseToken,
      lastToken: finalToken,
    }
  }

  const unsafeValuePropertyAccess: UnsafeIndeterminateValuePropertyAccess = {
    base: makeNamedNode(baseToken),
    baseToken,
    propertyAccesses: propertiesAccessed.map((p, i) => ({
      memberAccessOperatorToken: memberAccessOperatorTokens[i],
      propertyToken: p,
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
  let baseSoFar = finalPropertyAccess
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
      baseSoFar = pa as ValidValuePropertyAccess
      validIntermediatePropertyAccesses.unshift(baseSoFar)
    }
  }
  if (node.base.type === "type-identifier") {
    state.addError(
      tokenError(
        node.base.token,
        `"${node.base.token.text}" is a type and cannot be dereferenced (.) for a value`,
      ),
    )
  } else {
    baseSoFar = {
      memberAccessOperatorToken: null,
      propertyToken: node.base.token,
    } as unknown as ValidValuePropertyAccess
    validIntermediatePropertyAccesses.unshift(baseSoFar)
  }

  if (validIntermediatePropertyAccesses.length === 0) {
    return {
      type: "value-identifier",
      token: finalPropertyAccess.propertyToken,
    }
  }

  const baseToken: Token<typeof tValueIdentifier | typeof tThat> =
    validIntermediatePropertyAccesses[0].propertyToken
  return {
    type: "indeterminate-value-property-access",
    // TODO: Can we type this more safely?
    base: {
      type: baseToken.type === tValueIdentifier ? "value-identifier" : "that",
      token: baseToken,
    } as ValueIdentifier | TempThatNode,
    baseToken: baseToken,
    propertyAccesses: [
      ...validIntermediatePropertyAccesses.slice(1),
      finalPropertyAccess,
    ],
    firstToken: node.firstToken,
    lastToken: node.lastToken,
  }
}
