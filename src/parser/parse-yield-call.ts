import assert from "assert";
import { tYield } from "../tokenizer/token-type";
import type { YieldCall } from "../tree/yield-call";
import { parseCall } from "./parse-call";
import type { ParserState } from "./parser-state";

export function parseYieldCall(state: ParserState): YieldCall {
    const yieldToken = state.buffer.consumeToken()
    assert(yieldToken.type === tYield)
    const call = parseCall(state)
    return {
        type: "yield-call",
        yieldToken: yieldToken,
        call,
        firstToken: yieldToken,
        lastToken: call.lastToken
    }
}
