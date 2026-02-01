import { tNumberLiteral, tStartBlock, tStartString } from "tokenizer/token-type.ts"
import type {
  Block,
  NumberLiteral,
  StringLiteral,
  TypeIdentifier,
  ValueIdentifier,
} from "tree"
import type { BadParse } from "./error.ts"
import { parseBlock } from "./parse-block.ts"
import {
  parseAnyIndeterminateNamedExpression,
  parseIndeterminateNamedValueExpression,
} from "./parse-named-expression.ts"
import { parseStringLiteral } from "./parse-string.ts"
import type { ParserState } from "./parser-state.ts"
import {
  IndeterminateTypePropertyAccess,
  IndeterminateValuePropertyAccess,
  TempThatNode,
} from "./that.ts"

export type IndeterminateExpression =
  | Block
  | NumberLiteral
  | StringLiteral
  | TempThatNode
  | ValueIdentifier
  | IndeterminateValuePropertyAccess

export function parseLiteralExpressionOrFallback<T>(
  state: ParserState,
  fallback: (state: ParserState) => T,
) {
  const nextToken = state.buffer.peekToken()
  if (nextToken.type === tStartBlock) {
    return parseBlock(state)
  }
  if (nextToken.type === tNumberLiteral) {
    state.buffer.consumeToken()
    return {
      type: "number-literal",
      token: nextToken,
    } as const
  }
  if (nextToken.type === tStartString) {
    return parseStringLiteral(state)
  }
  return fallback(state)
}

export function parseIndeterminateValueExpression(
  state: ParserState,
): IndeterminateExpression | BadParse {
  return parseLiteralExpressionOrFallback(
    state,
    parseIndeterminateNamedValueExpression,
  )
}

export type IndeterminateTypeExpression =
  | TypeIdentifier
  | IndeterminateTypePropertyAccess

export function parseIndeterminateValueOrTypeExpression(
  state: ParserState,
): IndeterminateExpression | IndeterminateTypeExpression | BadParse {
  return parseLiteralExpressionOrFallback(
    state,
    parseAnyIndeterminateNamedExpression,
  )
}
