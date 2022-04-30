import { tokenError } from "../../../../compile-error";
import type { Call } from "../../../../tree/call";
import { nodeError } from "../../../../tree/tree-node";
import { fromComplicated, fromNode, fromToken, fromTokenRange, GeneratedSnippets, GeneratorFixture } from "../../../generator";
import type { GeneratorForGlobalSpec, SimpleCall } from "../../../generator-for-global";
import { ContextType, contextType, GeneratorState } from "../../../generator-state";
import { genIndent, makeIndent } from "../../../indent-string";
import { generateBlockLinesTs } from "../../block/generate-block-ts";
import { autoTightS } from "../helpers/auto-tight";
import { ensureStringLiteral } from "../helpers/ensure-string-literal";

export const namespaceThyScopeGenerator: GeneratorForGlobalSpec = {
    name: "scope",
    generateValue(state) {
        const space = makeIndent(state.indentLevel)
        const space2 = makeIndent(state.indentLevel + 1)
        return autoTightS(state, `() => {
${space2}throw new Error("thy.scope cannot be aliased")
${space}}`)
    },
    generateCall(node, state, fixture) {
        if (state.isExpressionContext()) {
            state.addError(nodeError(node.func, "thy.scope must be called as an independent statement"))
            return fromNode(node.func, "undefined")
        }

        if (node.args.length < 2) {
            state.addError(nodeError(node.func, "thy.scope requires 2 arguments"))
            return fromComplicated(node, ["// bad scope"])
        }

        for (const arg of node.typeArgs.slice(0)) {
            state.addError(nodeError(arg, `thy.scope cannot take any type arguments`))
        }
        for (const arg of node.args.slice(2)) {
            state.addError(nodeError(arg, `thy.scope cannot take more than 2 arguments`))
        }

        const shouldBeStringName = node.args[0]
        const namespaceName = ensureStringLiteral(shouldBeStringName)
        if (namespaceName === null) {
            state.addError(nodeError(shouldBeStringName, `Scope name must be a string literal`))
            return fromComplicated(node, ["// bad scope"])
        }

        const space = makeIndent(state.indentLevel)
        const space2 = makeIndent(state.indentLevel + 1)

        const shouldBeBlock = node.args[1]
        let generatedBody: GeneratedSnippets
        const childState = state.makeChild({ indentLevel: state.indentLevel + 1, context: contextType.blockAllowingExport })
        if (shouldBeBlock.type !== "block") {
            state.addError(nodeError(shouldBeBlock, `Scope body must be a block literal`))
            if (shouldBeBlock.type === "atom") {
                generatedBody = fromToken(shouldBeBlock.token)
            } else {
                generatedBody = fromComplicated(shouldBeBlock, [space2, "(", fixture.generate(shouldBeBlock, childState), ")()"])
            }
        } else {
            generatedBody = generateBlockLinesTs(shouldBeBlock, shouldBeBlock.ideas, childState, fixture)
        }
        let exportPart = ""
        if (state.indentLevel > 0) {
            exportPart = "export "
        }
        return fromComplicated(node, [
            exportPart, "namespace ", namespaceName, " {\n",
            generatedBody, "\n",
            space, "}"
        ])
    }
}
