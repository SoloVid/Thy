import { tokenError } from "../compile-error";
import type { Token } from "../tokenizer/token";
import { tEndBlock, tStatementContinuation, tStatementTerminator, tTypeIdentifier } from "../tokenizer/token-type";
import type { Call } from "../tree/call";
import { parseArguable } from "./parse-call";
import type { ParserState } from "./parser-state";

export interface Args {
    typeArgs: Call['typeArgs'];
    args: Call['args'];
}

export function parseCallArgs(state: ParserState): Args {
    const typeArgs: Call['typeArgs'] = []
    const args: Call['args'] = []

    let thatTaken: Token | null = null
    let beforeThatTaken: Token | null = null

    let nextToken = state.buffer.peekToken()
    let typeArgumentsEnded = false
    let moreArguments = ![tStatementTerminator, tEndBlock].includes(nextToken.type)
    while (moreArguments) {
        const arg = parseArguable(state)

        if (!typeArgumentsEnded && arg.type === 'identifier' && arg.target.type === tTypeIdentifier) {
            typeArgs.push(arg)
        } else {
            typeArgumentsEnded = true

            const translatedArg = getArgThat(arg)
            args.push(translatedArg)
        }

        nextToken = state.buffer.peekToken()
        if (arg.type === "block") {
            const continuation = nextToken.type === tStatementContinuation
            moreArguments = continuation
            if (continuation) {
                state.buffer.consumeToken()
            }
        } else {
            moreArguments = ![tStatementTerminator, tEndBlock].includes(nextToken.type)
        }
    }

    if (beforeThatTaken !== null && thatTaken === null) {
        state.addError(tokenError(beforeThatTaken, `beforeThat used without that`))
    }

    return {
        typeArgs,
        args
    }

    function getArgThat(arg: Call['args'][number]): Call['args'][number] {
        if (arg.type === 'identifier' && arg.target.text === 'that') {
            if (arg.scopes.length > 0) {
                state.addError(tokenError(arg.target, 'that cannot be scoped'))
                return arg
            }
            if (thatTaken !== null) {
                state.addError(tokenError(arg.target, `that already used`))
                return arg
            }
            const thatCall = state.context.takeThat()
            if (thatCall === null) {
                state.addError(tokenError(arg.target, `No preceding call is eligible to satisfy that`))
                return arg
            } else {
                thatTaken = arg.target
                return thatCall
            }
        }
        if (arg.type === 'identifier' && arg.target.text === 'beforeThat') {
            if (arg.scopes.length > 0) {
                state.addError(tokenError(arg.target, 'beforeThat cannot be scoped'))
                return arg
            }
            if (beforeThatTaken !== null) {
                state.addError(tokenError(arg.target, `that already used`))
                return arg
            }
            const beforeThatCall = state.context.takeBeforeThat()
            if (beforeThatCall === null) {
                state.addError(tokenError(arg.target, `No preceding call is eligible to satisfy beforeThat`))
                return arg
            } else {
                beforeThatTaken = arg.target
                return beforeThatCall
            }
        }
        return arg
    }
}
