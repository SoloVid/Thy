import assert from "utils/assert"
import {
  tConstDeclAssign,
  tExport,
  tNoDeclAssign,
  tPrivate,
  tType,
  tVarDeclAssign,
} from "../tokenizer/token-type"
import type { Assignment, TypeAssignment } from "../tree"
import { addTokenError } from "./error"
import { parseAssignmentGivenTargetAndOperator } from "./parse-assignment"
import {
  parseSpecialCallOrFallback,
  parseValueCallGivenTarget,
} from "./parse-call"
import { parseIndeterminateNamedValueExpression } from "./parse-named-expression"
import type { ParserState } from "./parser-state"
import { parseTypeAssignment } from "./parse-type-assignment"

/**
 * Parse an assignment idea beginning with export or private.
 */
export function parseModifiedAssignment(state: ParserState) {
  const modifierToken = state.buffer.consumeToken() as Exclude<
    Assignment["modifier"],
    null
  >
  assert(
    [tExport, tPrivate].includes(modifierToken.type),
    "parseModifiedAssignment() should only be called when next token is a modifier",
  )
  const afterToken = state.buffer.peekToken(1)
  if (afterToken.type === tType) {
    return parseTypeAssignment(
      state,
      modifierToken as TypeAssignment["modifier"],
    )
  } else {
    return parseAssignmentOrCall(state, modifierToken)
  }
}

export function parseAssignmentOrCall(
  state: ParserState,
  modifier: Assignment["modifier"] | null,
) {
  const callOrAssignment = parseSpecialCallOrFallback(state, (s) =>
    parseAssignmentOrValueCall(s, modifier),
  )
  if (modifier !== null && callOrAssignment.type !== "assignment") {
    addTokenError(state, modifier, `Modifier invalid preceding call site`)
  }
  return callOrAssignment
}

export function parseAssignmentOrValueCall(
  state: ParserState,
  modifier: Assignment["modifier"] | null,
) {
  const assignedOrCalled = parseIndeterminateNamedValueExpression(state)
  const possiblyAssignmentOperator = state.buffer.peekToken()
  if (
    [tConstDeclAssign, tVarDeclAssign, tNoDeclAssign].includes(
      possiblyAssignmentOperator.type,
    )
  ) {
    const operator = state.buffer.consumeToken() as Assignment["operator"]
    return parseAssignmentGivenTargetAndOperator(
      state,
      modifier,
      assignedOrCalled,
      operator,
    )
  }
  return parseValueCallGivenTarget(state, assignedOrCalled)
}
