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
    const argsAsUnknown = ta.call.args.map(a => `${state.getUniqueVariableName()}: unknown, `).join('')
    // TODO: Don't duplicate this logic from generate call.
    const argSnippets = ta.call.args.map((a, i) => {
        const childState = state.makeChild({ context: contextType.isolatedExpression })
        return [fixture.generate(a, childState), fromTokenRange(ta.call, ", ")]
    })
    return fromComplicated(ta, [
        `function _${name}_WrappedValue() { return `, callValue, ` }\n`,
        // TODO: This stuff needs to happen in the normal call generator too when isTypeContext is true.
        // TODO: type-call has to be handled separately from runtime call.
        // TODO: Do args for type-call get passed to type args or value args? I think value args?
        //       I think type args don't make sense for type functions unless they are actually types for value functions.
        `${indent}type _${name}_RestParams = (ReturnType<typeof _${name}_WrappedValue>) extends (${argsAsUnknown}...rest: infer U) => unknown ? U : []\n`,
        `${indent}function _${name}_Call() { return _${name}_WrappedValue()(`, argSnippets, `...([] as unknown[] as _${name}_RestParams)) }\n`,
        `${indent}const ${name} = undefined as unknown as ReturnType<typeof _${name}_Call>`,
    ])
}
