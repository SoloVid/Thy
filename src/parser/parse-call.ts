import assert from "assert";
import { tAnd, tEndBlock, tScopedTypeIdentifier, tStartBlock, tStatementTerminator, tUnscopedTypeIdentifier } from "../tokenizer/token-type";
import type { Atom } from "../tree/atom";
import type { Block } from "../tree/block";
import type { Call } from "../tree/call";
import { parseBlock } from "./parse-block";
import type { ParserState } from "./parser-state";

export function parseCall(state: ParserState): Call {
    const firstToken = state.buffer.peekToken()
    assert(firstToken !== null)

    const func = parseAtomOrBlock(state)
    // TODO: Verify token type.

    const typeArgs: Call['typeArgs'] = []
    const args: Call['args'] = []

    let nextToken = state.buffer.peekToken()
    // If we're immediately invoking a block, there's no reason (and readability suffers) for type args to be allowed.
    if (func.type === 'atom') {
        // TODO: verify assertion
        while ([tScopedTypeIdentifier, tUnscopedTypeIdentifier].includes(nextToken!.type)) {
            typeArgs.push({
                type: "atom",
                // TODO: Work out type here
                token: state.buffer.consumeToken()
            })
            nextToken = state.buffer.peekToken()
        }
    }
    // TODO: verify non-null assertions (x4 I think?)
    let moreArguments = ![tStatementTerminator, tEndBlock].includes(nextToken!.type)
    while (moreArguments) {
        // TODO: put "that" handling in here
        const arg = parseAtomOrBlock(state)
        args.push(arg)

        nextToken = state.buffer.peekToken()
        if (arg.type === "block") {
            const continuation = nextToken!.type === tAnd
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

    return {
        type: "call",
        func,
        typeArgs,
        args,
        firstToken,
        lastToken
    }
}

export function parseAtomOrBlock(state: ParserState): Atom | Block {
    const nextToken = state.buffer.peekToken()
    assert(nextToken !== null)
    if (nextToken.type === tStartBlock) {
        return parseBlock(state)
    }

    return {
        type: "atom",
        token: state.buffer.consumeToken()
    }
}