import type { TypeCall } from "../tree/type-call";
import { parseCall } from "./parse-call";
import type { ParserState } from "./parser-state";

export function parseTypeCall(state: ParserState): TypeCall {
    // TODO: Validate token
    // Consume 'type'
    state.buffer.consumeToken()
    const vanillaCall = parseCall(state)
    return {
        type: "type-call" as const,
        func: vanillaCall.func,
        args: [...vanillaCall.typeArgs, ...vanillaCall.args],
        firstToken: vanillaCall.firstToken,
        lastToken: vanillaCall.lastToken
    }
}
