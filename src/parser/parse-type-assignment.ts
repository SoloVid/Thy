import type { SaferToken } from "tokenizer/token"
import type { TypeIdentifier } from "tree"
import type { ErrorValue } from "tree/error"
import assert from "utils/assert"
import {
  tConstDeclAssign,
  tNoDeclAssign,
  tType,
  tTypeIdentifier,
  tVarDeclAssign,
} from "../tokenizer/token-type"
import type { TypeAssignment } from "../tree/type-assignment"
import { addTokenError } from "./error"
import { applyToSymbolTable } from "./parse-assignment"
import { parseTypeCallOrValueCall } from "./parse-type-call"
import type { ParserState } from "./parser-state"

export function parseTypeAssignment(
  state: ParserState,
  modifierToken: TypeAssignment["modifier"],
): TypeAssignment {
  const typeToken = state.buffer.consumeToken() as SaferToken<typeof tType>
  assert(
    typeToken.type === tType,
    `parseTypeAssignment() should only be called if next token is ${tType}`,
  )
  const unsafeVariable = state.buffer.consumeToken()
  const variable: TypeIdentifier | ErrorValue =
    unsafeVariable.type === tTypeIdentifier
      ? {
          type: "type-identifier",
          token: unsafeVariable as SaferToken<typeof tTypeIdentifier>,
        }
      : addTokenError(state, unsafeVariable, `Expected type identifier`)
  if (variable.type === "type-identifier") {
    applyToSymbolTable(state, variable.token, true)
  }

  const operator = parseTypeAssignmentOperatorToken(state)

  // TODO: Handle case of missing call.
  const call = parseTypeCallOrValueCall(state)

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
): TypeAssignment["operator"] {
  const operator = state.buffer.consumeToken()
  if ([tVarDeclAssign, tNoDeclAssign].includes(operator.type)) {
    return addTokenError(state, operator, `Types cannot be mutably assigned`)
  } else if (operator.type !== tConstDeclAssign) {
    return addTokenError(
      state,
      operator,
      `Unexpected token where "is" expected`,
    )
  }
  return operator as SaferToken<typeof tConstDeclAssign>
}
