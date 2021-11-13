import assert from "assert";
import { tokenError } from "../compile-error";
import type { Token } from "../tokenizer/token";
import { tMemberAccessOperator, tTypeIdentifier, tValueIdentifier } from "../tokenizer/token-type";
import type { Identifier } from "../tree/identifier";
import type { ParserState } from "./parser-state";

export function parseIdentifier(state: ParserState): Identifier {
    const rawTokens: Token[] = []
    const firstToken = state.buffer.consumeToken()
    rawTokens.push(firstToken)
    // TODO: Errors instead of asserts.
    assert(firstToken.type === tTypeIdentifier || firstToken.type === tValueIdentifier)

    let lastNameToken = firstToken
    const scopes: Token[] = []
    let nextToken = state.buffer.peekToken()
    while (nextToken.type === tMemberAccessOperator) {
        const maoToken = state.buffer.consumeToken()
        // TODO: check first?
        rawTokens.push(maoToken)
        const nextNameToken = state.buffer.peekToken()
        if (![tTypeIdentifier, tValueIdentifier].includes(nextNameToken.type)) {
            state.addError(tokenError(maoToken, `Dangling member access operator`))
            // TODO: break loop without `break`
            break
        } else {
            scopes.push(lastNameToken)
            lastNameToken = state.buffer.consumeToken()
            rawTokens.push(lastNameToken)
            nextToken = state.buffer.peekToken()
        }
    }

    for (const s of scopes) {
        if (s.type !== tValueIdentifier) {
            state.addError(tokenError(s, `"${s.text}" is used as a value for scoping when it is not`))
        }
    }

    return {
        type: "identifier",
        scopes: scopes,
        target: lastNameToken,
        rawTokens: rawTokens,
        firstToken: firstToken,
        lastToken: state.buffer.getPreviousToken()
    }
}