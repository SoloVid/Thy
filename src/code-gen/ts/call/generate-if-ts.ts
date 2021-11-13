import { assert } from "console";
import type { Call } from "../../../tree/call";
import { generateTs } from "../generate-ts";
import type { GeneratorState } from "../../generator-state";
import { GeneratedSnippets } from "../../generator";

export function tryGenerateDefTs(node: Call, state: GeneratorState): void | GeneratedSnippets {
    if (node.func.type !== "atom") {
        return
    }
    if (node.func.token.text !== "if") {
        return
    }
    // TODO: better error handling
    assert(node.args.length === 1)
    const childState = state.makeChild()
    childState.indentLevel++
    // TODO: Handle type parameter.
    return generateTs(node.args[0], childState)
}
