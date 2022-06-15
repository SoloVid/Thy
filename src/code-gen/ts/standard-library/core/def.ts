import type { Atom, PropertyAccess } from "../../../../tree";
import type { Expression, TypeExpression } from "../../../../tree/expression";
import { nodeError } from "../../../../tree/tree-node";
import { fromComplicated, fromNode, fromToken, fromTokenRange, GeneratedSnippets } from "../../../generator";
import type { GeneratorForGlobalSpec } from "../../../generator-for-global";
import { generateAssignmentTs2 } from "../../assignment/generate-assignment-ts";
import { isAtomIdentifier } from "../../atom/generate-atom-ts";
import { isSimpleNamed } from "../../generate-simple-named-expression";
import { generateTypeInstanceTs } from "../../generate-type-instance-ts";
import { autoTightS } from "../helpers/auto-tight";

export const defGenerator: GeneratorForGlobalSpec = {
    name: "def",
    generateValue(state) {
        return autoTightS(state, "<_T>(input: unknown) => (input as T)")
    },
    generateAssignment(node, state, fixture) {
        if (node.call.args.length === 0) {
            state.addError(nodeError(node.call.func, "def requires 1 argument"))
            return fromTokenRange(node, "undefined")
        }

        for (const arg of node.call.typeArgs.slice(1)) {
            state.addError(nodeError(arg, `def cannot take more than 1 type argument`))
        }
        for (const arg of node.call.args.slice(1)) {
            state.addError(nodeError(arg, `def cannot take more than 1 argument`))
        }

        const childState = state.makeChild()
        const expressionTs = fixture.generate(node.call.args[0], childState)
        return generateAssignmentTs2(node, state, fixture, expressionTs, node.call.typeArgs.length === 1 ? fixture.generate(node.call.typeArgs[0], childState) : undefined)
    },
    generateSimpleTypeCall(node, state, fixture) {
        if (node.args.length === 0) {
            state.addError(nodeError(node.func, "def requires 1 argument"))
            return fromTokenRange(node, "undefined")
        }

        for (const arg of node.args.slice(1)) {
            state.addError(nodeError(arg, `def cannot take more than 1 argument`))
        }

        return generateTypeInstanceTs(node.args[0], state, fixture)
    },
    generateTypeAssignment(node, state, fixture) {
        console.log("def type assignment generator")
        // It should be impossible to hit this case because def is a value function, not a type function.
        if (node.call.type === "type-call") {
            return
        }
        if (node.call.args.length === 0 && node.call.typeArgs.length === 0) {
            state.addError(nodeError(node.call.func, "def requires 1 argument"))
            return fromTokenRange(node, "undefined")
        }

        for (const arg of node.call.args.slice(1)) {
            state.addError(nodeError(arg, `def cannot take more than 1 type argument`))
        }
        for (const arg of node.call.args.slice(1)) {
            state.addError(nodeError(arg, `def cannot take more than 1 argument`))
        }

        function generateSimple(arg: Atom | PropertyAccess<never>, typeSnippet?: GeneratedSnippets) {
            return fromComplicated(node, [
                `const `, node.variable.text, ` = undefined as unknown as `,
                typeSnippet ?? generateTypeInstanceTs(arg, state, fixture)
            ])
        }

        if (node.call.typeArgs.length === 1 && isSimpleNamed(node.call.typeArgs[0])) {
            return generateSimple(node.call.typeArgs[0])
        }

        const oneArg = node.call.args[0]
        if (oneArg.type === "atom" && !isAtomIdentifier(oneArg)) {
            return generateSimple(oneArg, fromToken(oneArg.token))
        }

        if (isSimpleNamed(oneArg)) {
            return generateSimple(oneArg)
        }
    },
}