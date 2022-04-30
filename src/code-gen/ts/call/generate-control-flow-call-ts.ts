import { tokenError } from "../../../compile-error";
import type { Call } from "../../../tree/call";
import { nodeError } from "../../../tree/tree-node";
import { CodeGeneratorFunc, fromComplicated, fromToken, GeneratedSnippets, GeneratorFixture } from "../../generator";
import { contextType, GeneratorState } from "../../generator-state";

export function makeControlFlowCallTsGenerator(keyword: string): CodeGeneratorFunc<Call> {
    return (node: Call, state: GeneratorState, fixture: GeneratorFixture): void | GeneratedSnippets => {
        if (node.func.type !== "atom") {
            return
        }
        if (node.func.token.text !== keyword) {
            return
        }

        const keywordSnippet = fromToken(node.func.token, keyword)

        if (node.args.length < 1) {
            state.addError(tokenError(node.func.token, `${keyword} requires 1 argument`))
        }

        for (const arg of node.typeArgs) {
            state.addError(nodeError(arg, `${keyword} doesn't take any type arguments`))
        }

        for (const arg of node.args.slice(2)) {
            state.addError(nodeError(arg, `${keyword} only takes 1 argument`))
        }

        const childState = state.makeChild({context: contextType.isolatedExpression})
        const valueSnippet = node.args.length >= 1 ? fixture.generate(node.args[0], childState) : fromToken(node.func.token, 'undefined')

        return fromComplicated(node, [keywordSnippet, " ", valueSnippet])
    }
}
