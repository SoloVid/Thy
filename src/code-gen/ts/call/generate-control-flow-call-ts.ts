import { tokenError } from "../../../compile-error";
import type { Call } from "../../../tree/call";
import { nodeError } from "../../../tree/tree-node";
import { CodeGeneratorFunc, fromComplicated, fromToken, GeneratedSnippets } from "../../generator";
import { contextType, GeneratorState } from "../../generator-state";
import { generateTs } from "../generate-ts";

export function makeControlFlowCallTsGenerator(keyword: string): CodeGeneratorFunc<Call> {
    return (node: Call, state: GeneratorState): void | GeneratedSnippets => {
        if (node.func.type !== "identifier") {
            return
        }
        if (node.func.target.text !== keyword) {
            return
        }
        for (const scope of node.func.scopes) {
            state.addError(nodeError(scope, `${keyword} cannot be scoped`))
        }

        const keywordSnippet = fromToken(node.func.target, keyword)

        if (node.args.length < 1) {
            state.addError(tokenError(node.func.target, `${keyword} requires 1 argument`))
        }

        for (const arg of node.typeArgs) {
            state.addError(nodeError(arg, `${keyword} doesn't take any type arguments`))
        }

        for (const arg of node.args.slice(2)) {
            state.addError(nodeError(arg, `${keyword} only takes 1 argument`))
        }

        const valueSnippet = node.args.length >= 1 ? generateTs(node.args[0], state.makeChild({context: contextType.isolatedExpression})) : fromToken(node.func.target, 'undefined')

        return fromComplicated(node, [keywordSnippet, " ", valueSnippet])
    }
}
