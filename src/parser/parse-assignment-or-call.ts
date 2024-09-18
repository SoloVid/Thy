import {
  tConstDeclAssign,
  tNoDeclAssign,
  tVarDeclAssign,
} from "../tokenizer/token-type"
import type { Assignment } from "../tree"
import { addTokenError } from "./error"
import { parseAssignmentGivenTargetAndOperator } from "./parse-assignment"
import {
  parseSpecialCallOrFallback,
  parseValueCallGivenTarget,
} from "./parse-call"
import { parseIndeterminateNamedValueExpression } from "./parse-named-expression"
import type { ParserState } from "./parser-state"

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
