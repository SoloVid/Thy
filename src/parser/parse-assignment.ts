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
import type {
  Assignment,
  ConstantDeclaration,
  PropertyAssignment,
  VariableDeclaration,
  VariableReassignment,
} from "../tree/assignment"
import { addNodeError, addTokenError } from "./error"
import { getFirstToken } from "./helper"
import { parseCall } from "./parse-call"
import type { ParserState } from "./parser-state"
import {
  collapseThat,
  IndeterminateValuePropertyAccess,
  TempThatNode,
} from "./that"

export type PossibleAssignmentTarget =
  | ValueIdentifier
  | IndeterminateValuePropertyAccess
  | TempThatNode
  | ErrorValue

export function parseConstantDeclarationGivenTargetAndOperator(
  state: ParserState,
  modifier: ConstantDeclaration["modifier"],
  target: PossibleAssignmentTarget,
  operator: ConstantDeclaration["operator"],
): ConstantDeclaration {
  const call = parseCall(state)
  return {
    type: "constant-declaration",
    modifier,
    variable: validateDeclarable(state, target, operator),
    operator,
    call,
    firstToken: getFirstToken(target),
    lastToken: call.lastToken,
  }
}

export function parseVariableDeclarationGivenTargetAndOperator(
  state: ParserState,
  modifier: VariableDeclaration["modifier"],
  target: PossibleAssignmentTarget,
  operator: VariableDeclaration["operator"],
): VariableDeclaration {
  const call = parseCall(state)
  return {
    type: "variable-declaration",
    modifier,
    variable: validateDeclarable(state, target, operator),
    operator,
    call,
    firstToken: getFirstToken(target),
    lastToken: call.lastToken,
  }
}

function validateDeclarable(
  state: ParserState,
  target: PossibleAssignmentTarget,
  operator: Assignment["operator"],
): ValueIdentifier | ErrorValue {
  void collapseThat(state, target)

  if (target.type === "that") {
    return addNodeError(state, target, `Cannot assign to that`)
  }

  if (target.type === "indeterminate-value-property-access") {
    addTokenError(
      state,
      operator,
      `Property assignments cannot be declared. Did you mean to use "to"?`,
    )
    return {
      type: "error-value",
      firstToken: target.firstToken,
      lastToken: target.lastToken,
    }
  }

  checkSymbolTable(state, target, operator)

  return target
}

export function parseVariableReassignmentGivenTargetAndOperator(
  state: ParserState,
  target: Exclude<PossibleAssignmentTarget, IndeterminateValuePropertyAccess>,
  operator: VariableReassignment["operator"],
): VariableReassignment {
  const call = parseCall(state)
  const variable =
    target.type === "that"
      ? addNodeError(state, target, `Cannot assign to that`)
      : target
  checkSymbolTable(state, variable, operator)
  return {
    type: "variable-reassignment",
    modifier: null,
    variable: variable,
    operator,
    call,
    firstToken: getFirstToken(target),
    lastToken: call.lastToken,
  }
}

export function parsePropertyAssignmentGivenTargetAndOperator(
  state: ParserState,
  target: IndeterminateValuePropertyAccess,
  operator: PropertyAssignment["operator"],
): PropertyAssignment {
  const call = parseCall(state)
  return {
    type: "property-assignment",
    modifier: null,
    variable: collapseThat(state, target),
    operator,
    call,
    firstToken: getFirstToken(target),
    lastToken: call.lastToken,
  }
}

export function checkSymbolTable(
  state: ParserState,
  variable: ErrorValue | ValueIdentifier,
  operator: SaferToken<
    typeof tConstDeclAssign | typeof tVarDeclAssign | typeof tNoDeclAssign
  >,
) {
  if (variable.type === "error-value") {
    return
  }

  const baseVar = variable.token
  const varName = baseVar.text
  const symbolInfo = state.context.symbolTable.getSymbolInfo(varName)
  if (operator.type === tNoDeclAssign) {
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
