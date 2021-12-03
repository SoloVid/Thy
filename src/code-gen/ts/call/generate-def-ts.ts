import { assert } from "console";
import type { Call } from "../../../tree/call";
import { generateTs } from "../generate-ts";
import type { GeneratorState } from "../../generator-state";
import { tokenError } from "../../../compile-error";
import { fromToken, fromTokenRange, GeneratedSnippets } from "../../generator";

export const defName = "def"

export function tryGenerateDefTs(node: Call, state: GeneratorState): void | GeneratedSnippets {
    if (node.func.type !== "identifier") {
        return
    }
    // TODO: Maybe account for scopes?
    if (node.func.target.text !== defName) {
        return
    }
    if (node.args.length === 0) {
        state.addError(tokenError(node.func.target, "def requires 1 argument"))
        return fromTokenRange(node, "undefined")
    }
    // TODO: better error handling
    assert(node.args.length === 1)
    const childState = state.makeChild()
    childState.indentLevel++
    // TODO: Handle type parameter.
    return generateTs(node.args[0], childState)
}
