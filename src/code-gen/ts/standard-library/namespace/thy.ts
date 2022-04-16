import { tokenError } from "../../../../compile-error"
import { nodeError } from "../../../../tree/tree-node"
import { fromComplicated } from "../../../generator"
import type { GeneratorForGlobalParentSpec, GeneratorForGlobalSpec } from "../../../generator-for-global"
import { contextType } from "../../../generator-state"
import { makeIndent } from "../../../indent-string"
import { autoTightS } from "../helpers/auto-tight"
import { ensureStringLiteral } from "../helpers/ensure-string-literal"
import { namespaceThyScopeGenerator } from "./thy-scope"

export const namespaceThyGenerator: GeneratorForGlobalSpec & GeneratorForGlobalParentSpec = {
    name: "thy",
    children: [namespaceThyScopeGenerator],
    generateValue(state) {
        const space = makeIndent(state.indentLevel)
        const space2 = makeIndent(state.indentLevel + 1)
        return autoTightS(state, `() => {
${space2}throw new Error("thy cannot be aliased")
${space}}`)
    },
    generateAssignment(node, state, fixture) {
        const variablePart = fixture.generate(node.variable, state)

        if (node.call.args.length === 0) {
            state.addError(tokenError(node.call.func.target, "thy requires 1 argument"))
            return fromComplicated(node, ["// import ", variablePart])
        }

        for (const arg of node.call.typeArgs.slice(0)) {
            state.addError(nodeError(arg, `thy cannot take any type arguments`))
        }
        for (const arg of node.call.args.slice(1)) {
            state.addError(nodeError(arg, `thy cannot take more than 1 argument`))
        }

        const sourceNameArg = node.call.args[0]
        const referencedName = ensureStringLiteral(sourceNameArg)
        if (referencedName === null) {
            state.addError(nodeError(sourceNameArg, `thy can only accept a string literal as an argument`))
            return fromComplicated(node, ["import ", variablePart, " = ", fixture.generate(sourceNameArg, state.makeChild({ context: contextType.isolatedExpression }))])
        }

        const importSeq = ["import ", variablePart, " = ", referencedName]
        if ([variablePart].flat(Infinity).map(s => s.text).join("") !== referencedName) {
            return fromComplicated(node, importSeq)
        }
        return fromComplicated(node, ["// ", ...importSeq])
    }
}
