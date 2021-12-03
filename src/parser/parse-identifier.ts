import assert from "assert";
import { tokenError } from "../compile-error";
import type { Token } from "../tokenizer/token";
import { tMemberAccessOperator, tTypeIdentifier, tValueIdentifier } from "../tokenizer/token-type";
import type { Call } from "../tree/call";
import type { Identifier, PureIdentifier } from "../tree/identifier";
import { ParserState, thatAlreadyUsed, thatNotFound } from "./parser-state";

export function parseOstensibleIdentifier(state: ParserState): Identifier | Call {
    const pureIdentifier = parsePureIdentifier(state)
    return translateThat(state, pureIdentifier)
}

export function parsePureIdentifier(state: ParserState): PureIdentifier {
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
        scopes: scopes.map(t => ({ type: "atom", token: t })),
        target: lastNameToken,
        rawTokens: rawTokens,
        firstToken: firstToken,
        lastToken: state.buffer.getPreviousToken()
    }
}

function translateThat(state: ParserState, node: PureIdentifier): Identifier | Call {
    function getThatCall(thatToken: Token) {
        const thatCall = state.context.takeThat(thatToken)
        if (thatCall === thatNotFound) {
            state.addError(tokenError(thatToken, `No preceding call is eligible to satisfy that`))
            return null
        } else if (thatCall === thatAlreadyUsed) {
            state.addError(tokenError(thatToken, `that already used`))
            return null
        } else {
            return thatCall
        }
    }
    if (node.target.text === 'that') {
        if (node.scopes.length > 0) {
            state.addError(tokenError(node.target, 'that cannot be scoped'))
            return node
        }
        const thatCall = getThatCall(node.target)
        if (thatCall === null) {
            return node
        }
        return thatCall
    }
    if (node.scopes.length > 0 && node.scopes[0].token.text === 'that') {
        const thatCall = getThatCall(node.scopes[0].token)
        if (thatCall === null) {
            return node
        }
        return { ...node, scopes: [thatCall, ...node.scopes.slice(1)]}
    }

    function getBeforeThatCall(beforeThatToken: Token) {
        const beforeThatCall = state.context.takeBeforeThat(beforeThatToken)
        if (beforeThatCall === thatNotFound) {
            state.addError(tokenError(beforeThatToken, `No preceding call is eligible to satisfy beforeThat`))
            return null
        } else if (beforeThatCall === thatAlreadyUsed) {
            state.addError(tokenError(beforeThatToken, `beforeThat already used`))
            return null
        } else {
            return beforeThatCall
        }
    }
    if (node.target.text === 'beforeThat') {
        if (node.scopes.length > 0) {
            state.addError(tokenError(node.target, 'beforeThat cannot be scoped'))
            return node
        }
        const beforeThatCall = getBeforeThatCall(node.target)
        if (beforeThatCall === null) {
            return node
        }
        return beforeThatCall
    }
    if (node.scopes.length > 0 && node.scopes[0].token.text === 'beforeThat') {
        const beforeThatCall = getBeforeThatCall(node.scopes[0].token)
        if (beforeThatCall === null) {
            return node
        }
        return { ...node, scopes: [beforeThatCall, ...node.scopes.slice(1)]}
    }
    return node
}
