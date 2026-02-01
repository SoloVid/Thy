import { tokenError } from "common/compile-error.ts"
import type { Token } from "tokenizer"
import {
  tConstDeclAssign,
  tExport,
  tNoDeclAssign,
  tTypeIdentifier,
  tValueIdentifier,
  tVarDeclAssign,
} from "tokenizer/token-type.ts"
import type {
  Assignment,
  ConstantDeclaration,
  Declaration,
  PropertyAssignment,
  ValueIdentifier,
  VariableDeclaration,
  VariableReassignment,
} from "tree"
import { addNodeError, addTokenError, BadParse, badParse } from "./error.ts"
import { getFirstToken } from "./helper.ts"
import { parseCall } from "./parse-call.ts"
import type { ParserState } from "./parser-state.ts"
import {
  collapseThat,
  IndeterminateValuePropertyAccess,
  TempThatNode,
} from "./that.ts"

export type PossibleAssignmentTarget =
  | ValueIdentifier
  | IndeterminateValuePropertyAccess
  | TempThatNode

export function parseConstantDeclarationGivenTargetAndOperator(
  state: ParserState,
  modifier: ConstantDeclaration["modifier"],
  target: PossibleAssignmentTarget,
  operator: ConstantDeclaration["operator"],
): ConstantDeclaration | BadParse {
  const call = parseCall(state)
  if (call === badParse) return badParse
  const variable = validateDeclarable(state, modifier, target, operator)
  if (variable === badParse) return badParse
  return {
    type: "constant-declaration",
    modifier,
    variable,
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
): VariableDeclaration | BadParse {
  const call = parseCall(state)
  if (call === badParse) return badParse
  const variable = validateDeclarable(state, modifier, target, operator)
  if (variable === badParse) return badParse
  return {
    type: "variable-declaration",
    modifier,
    variable,
    operator,
    call,
    firstToken: getFirstToken(target),
    lastToken: call.lastToken,
  }
}

function validateDeclarable(
  state: ParserState,
  modifier: Declaration["modifier"],
  target: PossibleAssignmentTarget,
  operator: Declaration["operator"],
): ValueIdentifier | BadParse {
  void collapseThat(state, target)

  if (target.type === "that") {
    addNodeError(state, target, `Cannot assign to that`)
    return badParse
  }

  if (target.type === "indeterminate-value-property-access") {
    addTokenError(
      state,
      operator,
      `Property assignments cannot be declared. Did you mean to use "to"?`,
    )
    return badParse
  }

  checkSymbolTable(state, modifier, target, operator)

  return target
}

export function parseVariableReassignmentGivenTargetAndOperator(
  state: ParserState,
  target: Exclude<PossibleAssignmentTarget, IndeterminateValuePropertyAccess>,
  operator: VariableReassignment["operator"],
): VariableReassignment | BadParse {
  const call = parseCall(state)
  if (call === badParse) return badParse
  if (target.type === "that") {
    addNodeError(state, target, `Cannot assign to that`)
    return badParse
  }
  checkSymbolTable(state, null, target, operator)
  return {
    type: "variable-reassignment",
    modifier: null,
    variable: target,
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
): PropertyAssignment | BadParse {
  const call = parseCall(state)
  if (call === badParse) return badParse
  const variable = collapseThat(state, target)
  if (variable === badParse) return badParse
  return {
    type: "property-assignment",
    modifier: null,
    variable,
    operator,
    call,
    firstToken: getFirstToken(target),
    lastToken: call.lastToken,
  }
}

export function checkSymbolTable(
  state: ParserState,
  modifier: Assignment["modifier"],
  variable: ValueIdentifier,
  operator: Token<
    typeof tConstDeclAssign | typeof tVarDeclAssign | typeof tNoDeclAssign
  >,
) {
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
      applyToSymbolTable(
        state,
        modifier,
        baseVar,
        operator.type === tConstDeclAssign,
      )
    } else {
      addTokenError(
        state,
        baseVar,
        `"${varName}" is declared elsewhere and cannot be re-declared`,
      )
    }
  }
  return variable
}

export function applyToSymbolTable(
  state: ParserState,
  modifier: Assignment["modifier"],
  variable: Token<typeof tValueIdentifier | typeof tTypeIdentifier>,
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
  state.context.symbolTable.addSymbol(
    variable,
    isConstant,
    modifier === null
      ? "bare"
      : modifier.type === tExport
      ? "export"
      : "private",
  )
}
