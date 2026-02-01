import type { Token } from "tokenizer"
import {
  tEndString,
  tEndStringInterpolation,
  tStartString,
  tStartStringInterpolation,
  tStringText,
  tValueIdentifier,
} from "tokenizer/token-type.ts"
import type {
  StringInterpolation,
  StringLiteral,
  StringPart,
  ValueIdentifier,
} from "tree"
import assert from "utils/assert.ts"
import { addTokenError, badParse, BadParse } from "./error.ts"
import type { ParserState } from "./parser-state.ts"

export function parseStringLiteral(
  state: ParserState,
): StringLiteral | BadParse {
  const firstToken = state.buffer.consumeToken()
  assert(
    firstToken.type === tStartString,
    `parseStringLiteral() should only be called if next token is ${tStartString}`,
  )
  const parts: StringPart[] = []
  while (state.buffer.peekToken().type !== tEndString) {
    const nextToken = state.buffer.consumeToken()
    if (nextToken.type === tStringText) {
      parts.push({
        type: "string-content",
        token: nextToken,
      })
    } else if (nextToken.type === tStartStringInterpolation) {
      const part = parseStringInterpolation(state, nextToken)
      if (part === badParse) return badParse
      parts.push(part)
    } else {
      addTokenError(state, nextToken, `Unexpected token in string`)
    }
  }
  const endStringToken = state.buffer.consumeToken()
  assert(
    endStringToken.type === tEndString,
    "The only token that should have broken the loop is end of string",
  )
  return {
    type: "string-literal",
    parts: parts,
    firstToken: firstToken,
    lastToken: endStringToken,
  }
}

export function parseStringInterpolation(
  state: ParserState,
  firstToken: Token<typeof tStartStringInterpolation>,
): StringInterpolation | BadParse {
  const interpolationValue = state.buffer.consumeToken()
  if (interpolationValue.type !== tValueIdentifier) {
    addTokenError(
      state,
      interpolationValue,
      `Unexpected token in string interpolation (expected unscoped variable)`,
    )
    return badParse
  }
  const value: ValueIdentifier = {
    type: "value-identifier",
    token: interpolationValue,
  }
  while (state.buffer.peekToken().type !== tEndStringInterpolation) {
    const nextToken = state.buffer.consumeToken()
    addTokenError(
      state,
      nextToken,
      `Unexpected token in string interpolation (expected end of interpolation)`,
    )
  }
  const endInterpolationToken = state.buffer.consumeToken()
  assert(
    endInterpolationToken.type === tEndStringInterpolation,
    "The only token that should have broken the loop is end of string interpolation",
  )
  return {
    type: "string-interpolation",
    value: value,
    firstToken: firstToken,
    lastToken: endInterpolationToken,
  }
}
