import {
  tConstDeclAssign,
  tExport,
  tNoDeclAssign,
  tPrivate,
  tType,
  tVarDeclAssign,
} from "tokenizer/token-type.ts"
import type { Assignment } from "tree"
import { isAssignment } from "tree"
import assert from "utils/assert.ts"
import { addTokenError, badParse } from "./error.ts"
import {
  parseConstantDeclarationGivenTargetAndOperator,
  parsePropertyAssignmentGivenTargetAndOperator,
  parseVariableDeclarationGivenTargetAndOperator,
  parseVariableReassignmentGivenTargetAndOperator,
} from "./parse-assignment.ts"
import {
  parseSpecialCallOrFallback,
  parseValueCallGivenTarget,
} from "./parse-call.ts"
import { parseIndeterminateNamedValueExpression } from "./parse-named-expression.ts"
import { parseTypeAssignment } from "./parse-type-assignment.ts"
import type { ParserState } from "./parser-state.ts"

/**
 * Parse an assignment idea beginning with export or private.
 */
export function parseModifiedAssignment(state: ParserState) {
  const modifierToken = state.buffer.consumeToken()
  assert(
    !!modifierToken &&
      (modifierToken.type === tExport || modifierToken.type === tPrivate),
    "parseModifiedAssignment() should only be called when next token is a modifier",
  )
  const afterToken = state.buffer.peekToken(1)
  if (afterToken.type === tType) {
    return parseTypeAssignment(state, modifierToken)
  } else {
    return parseAssignmentOrCall(state, modifierToken)
  }
}

export function parseAssignmentOrCall(
  state: ParserState,
  modifier: Assignment["modifier"] | null,
) {
  const callOrAssignment = parseSpecialCallOrFallback(
    state,
    (s) => parseAssignmentOrValueCall(s, modifier),
  )
  if (callOrAssignment === badParse) {
    return badParse
  }
  if (modifier !== null && !isAssignment(callOrAssignment)) {
    addTokenError(state, modifier, `Modifier invalid preceding call site`)
  }
  return callOrAssignment
}

export function parseAssignmentOrValueCall(
  state: ParserState,
  modifier: Assignment["modifier"] | null,
) {
  const assignedOrCalled = parseIndeterminateNamedValueExpression(state)
  if (assignedOrCalled === badParse) return badParse
  const possiblyAssignmentOperator = state.buffer.peekToken()
  if (possiblyAssignmentOperator.type === tConstDeclAssign) {
    state.buffer.consumeToken()
    return parseConstantDeclarationGivenTargetAndOperator(
      state,
      modifier,
      assignedOrCalled,
      possiblyAssignmentOperator,
    )
  }
  if (possiblyAssignmentOperator.type === tVarDeclAssign) {
    state.buffer.consumeToken()
    return parseVariableDeclarationGivenTargetAndOperator(
      state,
      modifier,
      assignedOrCalled,
      possiblyAssignmentOperator,
    )
  }
  if (possiblyAssignmentOperator.type === tNoDeclAssign) {
    state.buffer.consumeToken()
    if (modifier !== null) {
      addTokenError(state, modifier, `Modifier invalid with "to"`)
    }
    if (assignedOrCalled.type === "indeterminate-value-property-access") {
      return parsePropertyAssignmentGivenTargetAndOperator(
        state,
        assignedOrCalled,
        possiblyAssignmentOperator,
      )
    }
    return parseVariableReassignmentGivenTargetAndOperator(
      state,
      assignedOrCalled,
      possiblyAssignmentOperator,
    )
  }
  return parseValueCallGivenTarget(state, assignedOrCalled)
}
