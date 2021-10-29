import assert from "assert";
import { tStatementContinuation, tEndBlock, tStatementTerminator } from "../tokenizer/token-type";
import type { TypeCall } from "../tree/type-call";
import { parseAtomOrBlock } from "./parse-call";
import type { ParserState } from "./parser-state";

export function parseTypeCall(state: ParserState): TypeCall {
    const firstToken = state.buffer.peekToken()
    assert(firstToken !== null)

    const func = {
        type: "atom",
        token: state.buffer.consumeToken()
    } as const
    // TODO: Verify token type.

    const args: TypeCall['args'] = []

    let nextToken = state.buffer.peekToken()

    // TODO: Don't duplicate all this code with parseCall()

    let moreArguments = ![tStatementTerminator, tEndBlock].includes(nextToken!.type)
    while (moreArguments) {
        // TODO: put "that" handling in here
        const arg = parseAtomOrBlock(state)
        args.push(arg)

        nextToken = state.buffer.peekToken()
        if (arg.type === "block") {
            const continuation = nextToken!.type === tStatementContinuation
            moreArguments = continuation
            if (continuation) {
                state.buffer.consumeToken()
            }
        } else {
            moreArguments = ![tStatementTerminator, tEndBlock].includes(nextToken!.type)
        }
    }

    // TODO: May want to be more precise here because this could give us an EndBlock
    const lastToken = state.buffer.getPreviousToken()
    if (nextToken!.type === tStatementTerminator) {
        // Consume the statement separator.
        state.buffer.consumeToken()
    }

    // let nextToken = state.buffer.peekToken()
    // // TODO: verify assertion
    // while (nextToken!.type !== tStatementTerminator) {
    //     // TODO: put "that" handling in here
    //     args.push(parseAtomOrBlock(state))
    //     nextToken = state.buffer.peekToken()
    // }

    // const lastToken = state.buffer.getPreviousToken()
    // // Consume the statement separator.
    // state.buffer.consumeToken()

    return {
        type: "type-call",
        func,
        args,
        firstToken,
        lastToken
    }
}
