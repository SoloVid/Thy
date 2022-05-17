import { tokenError } from "../compile-error";
import type { Token } from "../tokenizer/token";
import { tConstDeclAssign, tExport, tNoDeclAssign, tPrivate, tVarDeclAssign } from "../tokenizer/token-type";
import { nodeError } from "../tree";
import type { Assignment } from "../tree/assignment";
import { parseCall } from "./parse-call";
import { parseNamedExpression } from "./parse-named-expression";
import type { ParserState } from "./parser-state";

export function parseAssignment(state: ParserState): Assignment {
    // TODO: Validate beginning of assignment?
    const firstToken = state.buffer.peekToken()
    const modifier = [tExport, tPrivate].includes(firstToken.type) ? state.buffer.consumeToken() : null
    const variable = parseNamedExpression(state)
    // if (variable.type === "call") {
    //     state.addError(nodeError(variable, "Cannot assign to a call"))
    // }
    const operator = state.buffer.consumeToken()

    if (variable.type === 'atom') {
        const baseVar = variable.token
        const varName = baseVar.text
        const symbolInfo = state.context.symbolTable.getSymbolInfo(varName)
        if (operator.type === tNoDeclAssign) {
            if (symbolInfo === null) {
                // If we don't have the symbol info, the only valid possibility is that the variable is an implicit parameter.
                // Implicit parameters are readonly, but if they're accessing a member they may be able to assign it.
                state.addError(tokenError(baseVar, `"${varName}" is not declared in this scope`))
            } else if (symbolInfo.isConstant) {
                state.addError(tokenError(baseVar, `"${varName}" is constant and cannot be reassigned`))
            }
        } else if (operator.type === tConstDeclAssign || operator.type === tVarDeclAssign) {
            if (symbolInfo === null) {
                applyToSymbolTable(state, baseVar, operator.type === tConstDeclAssign)
            } else {
                state.addError(nodeError(variable, `Scoped variable is declared elsewhere and cannot be re-declared`))
            }
        }
    }

    // TODO: Handle case of end statement immediately after assignment operator.
    // const nextToken = state.buffer.peekToken()
    // if (nextToken.type === tStatementTerminator) {
    //     state.addError()
    // } else if (nextToken.type === tEndBlock) {
    // }
    const call = parseCall(state)
    return {
        type: "assignment",
        symbolTable: state.context.symbolTable,
        modifier,
        variable,
        operator,
        call,
        firstToken: variable.type === 'atom' ? variable.token : variable.firstToken,
        lastToken: call.lastToken
    }
}

function applyToSymbolTable(state: ParserState, variable: Token<string>, isConstant: boolean): void {
    if (state.context.symbolTable.getSymbolInfo(variable.text) !== null) {
        state.addError(tokenError(variable, `"${variable.text}" is already declared in this scope and cannot be re-declared`))
    } else if (state.context.symbolTable.isSymbolNameTakenHereOrInChild(variable.text)) {
        state.addError(tokenError(variable, `"${variable.text}" is declared in a child scope and cannot be overshadowed with an alternate declaration here`))
    }
    state.context.symbolTable.addSymbol(variable, isConstant)
}
