import { tokenError } from "../compile-error";
import type { Token } from "../tokenizer/token";
import { tEndBlock, tStatementContinuation, tStatementTerminator, tTypeIdentifier } from "../tokenizer/token-type";
import type { Call } from "../tree/call";
import { parseArguable } from "./parse-arguable";
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

        const argLastToken = arg.type === 'atom' ? arg.token : arg.lastToken

        if (!typeArgumentsEnded && (arg.type === 'atom' || arg.type === 'property-access') && argLastToken.type === tTypeIdentifier) {
            typeArgs.push(arg)
        } else {
            typeArgumentsEnded = true
            args.push(arg)
        }

        nextToken = state.buffer.peekToken()
        if (arg.type === "block") {
            const continuation = nextToken.type === tStatementContinuation
            moreArguments = continuation
            if (continuation) {
                state.buffer.consumeToken()
            }
            // TODO: What if we get statement/block end right after continuation token?
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
}
