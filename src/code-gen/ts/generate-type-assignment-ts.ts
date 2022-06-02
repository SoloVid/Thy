import type { TreeNode } from "../../tree/tree-node";
import type { TypeAssignment } from "../../tree/type-assignment";
import { fromComplicated, GeneratedSnippets, GeneratorFixture } from "../generator";
import { contextType, GeneratorState } from "../generator-state";
import { generateCallTs } from "./call/generate-call-ts";
import { generateTypeCallTs } from "./generate-type-call-ts";

export function tryGenerateTypeAssignmentTs(node: TreeNode, state: GeneratorState, fixture: GeneratorFixture): void | GeneratedSnippets {
    if (node.type === "type-assignment") {
        return generateTypeAssignmentTs(node, state, fixture)
    }
}

export function generateTypeAssignmentTs(ta: TypeAssignment, state: GeneratorState, fixture: GeneratorFixture): GeneratedSnippets {
    const name = ta.variable.text
    const childState = state.makeChild({ context: contextType.isolatedExpression, isTypeContext: true })
    const generatedCall = ta.call.type === 'call' ? generateCallTs(ta.call, childState, fixture, name) : generateTypeCallTs(ta.call, childState, fixture, name)
    state.addPreStatementGenerator((s, f) => fromComplicated(ta, [
        `function _${name}_Call() { return `, generatedCall, ` }`
    ]))
    return fromComplicated(ta, [
        `const ${name} = undefined as unknown as ReturnType<typeof _${name}_Call>`,
    ])
}
