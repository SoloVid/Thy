import assert from "assert";
import { tStatementTerminator } from "../tokenizer/token-type";
import type { Identifier } from "../tree/identifier";
import type { TypeCall } from "../tree/type-call";
import { parseCall, parseIdentifier } from "./parse-call";
import { parseCallArgs } from "./parse-call-arguments";
import type { ParserState } from "./parser-state";

export function parseTypeCall(state: ParserState): TypeCall {
    const vanillaCall = parseCall(state)
    return {
        type: "type-call" as const,
        func: vanillaCall.func as Identifier,
        args: [...vanillaCall.typeArgs, ...vanillaCall.args],
        firstToken: vanillaCall.firstToken,
        lastToken: vanillaCall.lastToken
    }
    

    // const firstToken = state.buffer.peekToken()

    // const func = parseIdentifier(state)
    // // TODO: Verify token type.

    // const splitArgs = parseCallArgs(state)
    // const args: TypeCall['args'] = [...splitArgs.typeArgs, ...splitArgs.args]

    // // TODO: May want to be more precise here because this could give us an EndBlock
    // const lastToken = state.buffer.getPreviousToken()
    // if (state.buffer.peekToken().type === tStatementTerminator) {
    //     // Consume the statement separator.
    //     state.buffer.consumeToken()
    // }

    // return {
    //     type: "type-call",
    //     func,
    //     args,
    //     firstToken,
    //     lastToken
    // }
}
