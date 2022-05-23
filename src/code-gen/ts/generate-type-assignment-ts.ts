import type { TreeNode } from "../../tree/tree-node";
import type { TypeAssignment } from "../../tree/type-assignment";
import { fromComplicated, fromTokenRange, GeneratedSnippets, GeneratorFixture } from "../generator";
import { contextType, GeneratorState } from "../generator-state";
import { makeIndent } from "../indent-string";

export function tryGenerateTypeAssignmentTs(node: TreeNode, state: GeneratorState, fixture: GeneratorFixture): void | GeneratedSnippets {
    if (node.type === "type-assignment") {
        return generateTypeAssignmentTs(node, state, fixture)
    }
}

export function generateTypeAssignmentTs(ta: TypeAssignment, state: GeneratorState, fixture: GeneratorFixture): GeneratedSnippets {
    const name = ta.variable.text
    const indent = makeIndent(state.indentLevel)
    const callValue = fixture.generate(ta.call.func, state.makeChild({ context: contextType.isolatedExpression, isTypeContext: true }))
    return fromComplicated(ta, [
        `function _${name}_WrappedValue() { return `, callValue, ` }\n`,
        `${indent}type _${name}_RestParams = (ReturnType<typeof _${name}_WrappedValue>) extends (...rest: infer U) => unknown ? U : []\n`,
        `${indent}function _${name}_Call() { return _${name}_WrappedValue()(...([] as unknown[] as _${name}_RestParams)) }\n`,
        `${indent}const ${name} = undefined as unknown as ReturnType<typeof _${name}_Call>`,
    ])
}
