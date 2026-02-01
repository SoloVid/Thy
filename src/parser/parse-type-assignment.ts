import {
  tConstDeclAssign,
  tNoDeclAssign,
  tType,
  tTypeIdentifier,
  tVarDeclAssign,
} from "tokenizer/token-type.ts"
import type { TypeAssignment, TypeIdentifier } from "tree"
import assert from "utils/assert.ts"
import { addTokenError, BadParse, badParse } from "./error.ts"
import { applyToSymbolTable } from "./parse-assignment.ts"
import { parseTypeCallOrValueCall } from "./parse-type-call.ts"
import type { ParserState } from "./parser-state.ts"

export function parseTypeAssignment(
  state: ParserState,
  modifierToken: TypeAssignment["modifier"],
): TypeAssignment | BadParse {
  const typeToken = state.buffer.consumeToken()
  assert(
    typeToken.type === tType,
    `parseTypeAssignment() should only be called if next token is ${tType}`,
  )
  const unsafeVariable = state.buffer.consumeToken()
  if (unsafeVariable.type !== tTypeIdentifier) {
    addTokenError(state, unsafeVariable, `Expected type identifier`)
    return badParse
  }

  const variable: TypeIdentifier = {
    type: "type-identifier",
    token: unsafeVariable,
  }
  applyToSymbolTable(state, modifierToken, variable.token, true)

  const operator = parseTypeAssignmentOperatorToken(state)
  if (operator === badParse) return badParse

  // TODO: Handle case of missing call.
  const call = parseTypeCallOrValueCall(state)
  if (call === badParse) return badParse

  return {
    type: "type-assignment",
    modifier: modifierToken,
    typeToken,
    variable,
    operator,
    call,
    firstToken: typeToken,
    lastToken: call.lastToken,
  }
}

function parseTypeAssignmentOperatorToken(
  state: ParserState,
): TypeAssignment["operator"] | BadParse {
  const operator = state.buffer.consumeToken()
  if ([tVarDeclAssign, tNoDeclAssign].includes(operator.type)) {
    addTokenError(state, operator, `Types cannot be mutably assigned`)
    return badParse
  } else if (operator.type !== tConstDeclAssign) {
    addTokenError(state, operator, `Unexpected token where "is" expected`)
    return badParse
  }
  return operator
}
