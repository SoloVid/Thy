import { tokenError } from "../compile-error";
import { tConstDeclAssign, tExport, tPrivate, tTypeIdentifier } from "../tokenizer/token-type";
import { getEndOfPropertyAccess2 } from "../tree/property-access";
import type { TypeAssignment } from "../tree/type-assignment";
import { applyToSymbolTable } from "./parse-assignment";
import { parseCall } from "./parse-call";
import type { ParserState } from "./parser-state";

export function parseTypeAssignment(state: ParserState): TypeAssignment {
    // TODO: Validate token
    // Consume 'type'
    const typeToken = state.buffer.consumeToken()
    const firstToken = state.buffer.peekToken()
    const modifier = [tExport, tPrivate].includes(firstToken.type) ? state.buffer.consumeToken() : null
    const variable = state.buffer.consumeToken()
    applyToSymbolTable(state, variable, true)
    // TODO: Validate some token types etc.

    const operator = state.buffer.consumeToken()
    if (operator.type !== tConstDeclAssign) {
        state.addError(tokenError(operator, `Types cannot be mutably assigned`))
    }

    // TODO: Handle case of missing call.

    // TODO: This is a bit of abusing parseCall().
    // I think sharing the code is a good idea, but I think we have some wrong semantics going on.
    const vanillaCall = parseCall(state)
    const accessToken = getEndOfPropertyAccess2(vanillaCall.func)
    const isTypeCall = accessToken === null ? false : accessToken.type === tTypeIdentifier
    const call = !isTypeCall ? vanillaCall : {
        type: "type-call" as const,
        func: vanillaCall.func,
        args: [...vanillaCall.typeArgs, ...vanillaCall.args],
        firstToken: vanillaCall.firstToken,
        lastToken: vanillaCall.lastToken
    }

    return {
        type: "type-assignment",
        modifier,
        typeToken,
        variable,
        operator,
        call,
        firstToken: variable,
        lastToken: call.lastToken
    }
}
