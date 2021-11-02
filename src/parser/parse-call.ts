import assert from "assert";
import { tokenError, tokenRangeError } from "../compile-error";
import type { Token } from "../tokenizer/token";
import { tEndBlock, tMemberAccessOperator, tStartBlock, tStatementContinuation, tStatementTerminator, tTypeIdentifier, tValueIdentifier } from "../tokenizer/token-type";
import type { Atom } from "../tree/atom";
import type { Block } from "../tree/block";
import type { Call } from "../tree/call";
import type { Identifier } from "../tree/identifier";
import { parseBlock } from "./parse-block";
import { parseCallArgs } from "./parse-call-arguments";
import type { ParserState } from "./parser-state";

export function parseCall(state: ParserState): Call {
    const firstToken = state.buffer.peekToken()
    assert(firstToken !== null)

    const func = parseArguable(state)
    // TODO: Verify token type.

    const args = parseCallArgs(state);

    // const typeArgs: Call['typeArgs'] = []
    // const args: Call['args'] = []

    // let thatTaken: Token | null = null
    // let beforeThatTaken: Token | null = null

    // let nextToken = state.buffer.peekToken()
    // let typeArgumentsEnded = false
    // If we're immediately invoking a block, there's no reason (and readability suffers) for arguments to be allowed.
    if (func.type === 'identifier') {
        // let moreArguments = ![tStatementTerminator, tEndBlock].includes(nextToken.type)
        // while (moreArguments) {
        //     // TODO: put "that" handling in here
        //     const arg = parseArguable(state)

        //     if (!typeArgumentsEnded && arg.type === 'identifier' && arg.target.type === tTypeIdentifier) {
        //         typeArgs.push(arg)
        //     } else {
        //         typeArgumentsEnded = true

        //         const translatedArg = getArgThat(arg)
        //         args.push(translatedArg)
        //     }

        //     nextToken = state.buffer.peekToken()
        //     if (arg.type === "block") {
        //         const continuation = nextToken.type === tStatementContinuation
        //         moreArguments = continuation
        //         if (continuation) {
        //             state.buffer.consumeToken()
        //         }
        //     } else {
        //         moreArguments = ![tStatementTerminator, tEndBlock].includes(nextToken.type)
        //     }
        // }
    } else if (func.type !== 'block') {
        state.addError(tokenError(func.token, `${func.token} is called as if it were a function when it is not`))
    } else {
        // TODO: What do we do with arguments here?
    }

    // TODO: May want to be more precise here because this could give us an EndBlock
    const lastToken = state.buffer.getPreviousToken()
    if (state.buffer.peekToken().type === tStatementTerminator) {
        // Consume the statement separator.
        state.buffer.consumeToken()
    }

    // if (beforeThatTaken !== null && thatTaken === null) {
    //     state.addError(tokenError(beforeThatTaken, `beforeThat used without that`))
    // }

    return {
        type: "call",
        func,
        typeArgs: args.typeArgs,
        args: args.args,
        firstToken,
        lastToken
    }

    // function getArgThat(arg: Call['args'][number]): Call['args'][number] {
    //     if (arg.type === 'identifier' && arg.target.text === 'that') {
    //         if (arg.scopes.length > 0) {
    //             state.addError(tokenError(arg.target, 'that cannot be scoped'))
    //             return arg
    //         }
    //         if (thatTaken !== null) {
    //             state.addError(tokenError(arg.target, `that already used`))
    //             return arg
    //         }
    //         const thatCall = state.context.takeThat()
    //         if (thatCall === null) {
    //             state.addError(tokenError(arg.target, `No preceding call is eligible to satisfy that`))
    //             return arg
    //         } else {
    //             thatTaken = arg.target
    //             return thatCall
    //         }
    //     }
    //     if (arg.type === 'identifier' && arg.target.text === 'beforeThat') {
    //         if (arg.scopes.length > 0) {
    //             state.addError(tokenError(arg.target, 'beforeThat cannot be scoped'))
    //             return arg
    //         }
    //         if (beforeThatTaken !== null) {
    //             state.addError(tokenError(arg.target, `that already used`))
    //             return arg
    //         }
    //         const beforeThatCall = state.context.takeBeforeThat()
    //         if (beforeThatCall === null) {
    //             state.addError(tokenError(arg.target, `No preceding call is eligible to satisfy beforeThat`))
    //             return arg
    //         } else {
    //             beforeThatTaken = arg.target
    //             return beforeThatCall
    //         }
    //     }
    //     return arg
    // }
}

export function parseArguable(state: ParserState): Atom | Block | Identifier {
    const nextToken = state.buffer.peekToken()
    assert(nextToken !== null)
    if (nextToken.type === tStartBlock) {
        return parseBlock(state)
    }

    if (nextToken.type === tTypeIdentifier || nextToken.type === tValueIdentifier) {
        return parseIdentifier(state)
    }

    return {
        type: "atom",
        token: state.buffer.consumeToken()
    }
}

export function parseIdentifier(state: ParserState): Identifier {
    const firstToken = state.buffer.consumeToken()
    // TODO: Errors instead of asserts.
    assert(firstToken.type === tTypeIdentifier || firstToken.type === tValueIdentifier)

    let lastNameToken = firstToken
    const scopes: Token[] = []
    let nextToken = state.buffer.peekToken()
    while (nextToken.type === tMemberAccessOperator) {
        const maoToken = state.buffer.consumeToken()
        // TODO: check first?
        const nextNameToken = state.buffer.peekToken()
        if (![tTypeIdentifier, tValueIdentifier].includes(nextNameToken.type)) {
            state.addError(tokenError(maoToken, `Dangling member access operator`))
            // TODO: break loop without `break`
            break
        } else {
            scopes.push(lastNameToken)
            lastNameToken = state.buffer.consumeToken()
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
        firstToken: firstToken,
        lastToken: state.buffer.getPreviousToken()
    }
}