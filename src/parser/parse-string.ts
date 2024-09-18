import type {
  StringInterpolation,
  StringLiteral,
  StringPart,
} from "tree/string"
import type { ParserState } from "./parser-state"
import assert from "utils/assert"
import {
  tEndString,
  tEndStringInterpolation,
  tStartString,
  tStartStringInterpolation,
  tStringText,
  tValueIdentifier,
} from "tokenizer/token-type"
import { ValueIdentifier } from "tree"
import { ErrorValue } from "tree/error"
import { SaferToken } from "tokenizer/token"
import { addTokenError } from "./error"

export function parseStringLiteral(state: ParserState): StringLiteral {
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
        token: nextToken as SaferToken<typeof tStringText>,
      })
    } else if (nextToken.type === tStartStringInterpolation) {
      parts.push(
        parseStringInterpolation(
          state,
          nextToken as SaferToken<typeof tStartStringInterpolation>,
        ),
      )
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
  firstToken: SaferToken<typeof tStartStringInterpolation>,
): StringInterpolation {
  // const firstToken = state.buffer.consumeToken()
  // assert(firstToken.type === tStartStringInterpolation, `parseStringInterpolation() should only be called if next token is ${tStartStringInterpolation}`)
  const interpolationValue = state.buffer.consumeToken()
  const value: ValueIdentifier | ErrorValue =
    interpolationValue.type === tValueIdentifier
      ? {
          type: "value-identifier",
          token: interpolationValue as SaferToken<typeof tValueIdentifier>,
        }
      : addTokenError(
          state,
          interpolationValue,
          `Unexpected token in string interpolation (expected unscoped variable)`,
        )
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
