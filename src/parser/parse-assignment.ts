import { tokenError, tokenRangeError } from "../compile-error";
import type { Token } from "../tokenizer/token";
import { tConstDeclAssign, tExport, tNoDeclAssign, tPrivate, tVarDeclAssign } from "../tokenizer/token-type";
import type { Assignment } from "../tree/assignment";
import type { Identifier } from "../tree/identifier";
import { parseCall, parseIdentifier } from "./parse-call";
import type { ParserState } from "./parser-state";

export function parseAssignment(state: ParserState): Assignment {
    // TODO: Validate beginning of assignment?
    const firstToken = state.buffer.peekToken()
    const modifier = [tExport, tPrivate].includes(firstToken.type) ? state.buffer.consumeToken() : null
    const variable = parseIdentifier(state)
    const operator = state.buffer.consumeToken()

    const baseVar = getBaseOfIdentifier(variable)

    if (operator.type === tNoDeclAssign) {
        const symbolInfo = state.context.symbolTable.getSymbolInfo(baseVar.text)
        if (symbolInfo === null) {
            state.addError(tokenError(baseVar, `"${baseVar.text}" is not declared in this scope`))
        } else if (symbolInfo.isConstant) {
            state.addError(tokenError(baseVar, `"${baseVar.text}" is constant and cannot be reassigned`))
        }
    } else if (operator.type === tConstDeclAssign || operator.type === tVarDeclAssign) {
        if (variable.scopes.length > 0) {
            state.addError(tokenRangeError(variable, `Scoped variable is declared elsewhere and cannot be re-declared`))
        } else { 
            applyToSymbolTable(state, baseVar, operator.type === tConstDeclAssign)
        }
    }

    // TODO: Handle case of end statement immediately after assignment operator.
    const call = parseCall(state)
    return {
        type: "assignment",
        modifier,
        variable,
        operator,
        call,
        firstToken: variable.firstToken,
        lastToken: call.lastToken
    }
}

function applyToSymbolTable(state: ParserState, variable: Token<string>, isConstant: boolean): void {
    if (state.context.symbolTable.getSymbolInfo(variable.text) !== null) {
        state.addError(tokenError(variable, `"${variable}" is already declared in this scope and cannot be re-declared`))
    } else if (state.context.symbolTable.isSymbolNameTakenHereOrInChild(variable.text)) {
        state.addError(tokenError(variable, `"${variable.text}" is declared in a child scope and cannot be overshadowed with an alternate declaration here`))
    }
    state.context.symbolTable.addSymbol(variable, isConstant)
}

function getBaseOfIdentifier(identifier: Identifier): Token<string> {
    if (identifier.scopes.length > 0) {
        return identifier.scopes[0]
    }
    return identifier.target
}
