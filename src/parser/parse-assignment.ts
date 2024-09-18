import { ErrorValue } from "tree/error"
import { tokenError } from "../compile-error"
import type { SaferToken } from "../tokenizer/token"
import {
  tConstDeclAssign,
  tNoDeclAssign,
  tTypeIdentifier,
  tValueIdentifier,
  tVarDeclAssign,
} from "../tokenizer/token-type"
import { ValueIdentifier } from "../tree"
import type { Assignment } from "../tree/assignment"
import { addNodeError, addTokenError } from "./error"
import { getFirstToken } from "./helper"
import { parseCall } from "./parse-call"
import type { ParserState } from "./parser-state"
import {
  collapseThat,
  IndeterminateValuePropertyAccess,
  TempThatNode,
} from "./that"

export function parseAssignmentGivenTargetAndOperator(
  state: ParserState,
  modifier: Assignment["modifier"],
  target:
    | ValueIdentifier
    | IndeterminateValuePropertyAccess
    | TempThatNode
    | ErrorValue,
  operator: Assignment["operator"],
): Assignment {
  const call = parseCall(state)
  const variable = validateVariable(state, modifier, target, operator)
  return {
    type: "assignment",
    modifier,
    variable: variable,
    operator,
    call,
    firstToken: getFirstToken(target),
    lastToken: call.lastToken,
  }
}

export function validateVariable(
  state: ParserState,
  modifier: Assignment["modifier"],
  variable:
    | ValueIdentifier
    | IndeterminateValuePropertyAccess
    | TempThatNode
    | ErrorValue,
  operator: SaferToken<
    typeof tConstDeclAssign | typeof tVarDeclAssign | typeof tNoDeclAssign
  >,
): Assignment["variable"] {
  if (variable.type === "error-value") {
    return variable
  }

  if (variable.type === "that") {
    void collapseThat(state, variable)
    return addNodeError(state, variable, `Cannot assign to that`)
  }

  if (variable.type === "indeterminate-value-property-access") {
    if (modifier !== null) {
      addTokenError(
        state,
        modifier,
        `Property assignments cannot be exported or made private`,
      )
    }
    if (operator.type !== tNoDeclAssign) {
      addTokenError(
        state,
        operator,
        `Property assignments cannot be declared. Did you mean to use "to"?`,
      )
    }
    return collapseThat(state, variable)
  }

  const baseVar = variable.token
  const varName = baseVar.text
  const symbolInfo = state.context.symbolTable.getSymbolInfo(varName)
  if (operator.type === tNoDeclAssign) {
    if (modifier !== null) {
      addTokenError(state, modifier, `Modifier invalid with "to"`)
    }
    if (symbolInfo === null) {
      // If we don't have the symbol info, the only valid possibility is that the variable is an implicit parameter.
      // Implicit parameters are readonly, but if they're accessing a member they may be able to assign it.
      addTokenError(
        state,
        baseVar,
        `"${varName}" is not declared in this scope`,
      )
    } else if (symbolInfo.isConstant) {
      addTokenError(
        state,
        baseVar,
        `"${varName}" is constant and cannot be reassigned`,
      )
    }
  } else if (
    operator.type === tConstDeclAssign ||
    operator.type === tVarDeclAssign
  ) {
    if (symbolInfo === null) {
      applyToSymbolTable(state, baseVar, operator.type === tConstDeclAssign)
    } else {
      addTokenError(
        state,
        baseVar,
        `Scoped variable is declared elsewhere and cannot be re-declared`,
      )
    }
  }
  return variable
}

export function applyToSymbolTable(
  state: ParserState,
  variable: SaferToken<typeof tValueIdentifier | typeof tTypeIdentifier>,
  isConstant: boolean,
): void {
  if (state.context.symbolTable.getSymbolInfo(variable.text) !== null) {
    state.addError(
      tokenError(
        variable,
        `"${variable.text}" is already declared in this scope and cannot be re-declared`,
      ),
    )
  } else if (
    state.context.symbolTable.isSymbolNameTakenHereOrInChild(variable.text)
  ) {
    state.addError(
      tokenError(
        variable,
        `"${variable.text}" is declared in a child scope and cannot be overshadowed with an alternate declaration here`,
      ),
    )
  }
  state.context.symbolTable.addSymbol(variable, isConstant)
}
