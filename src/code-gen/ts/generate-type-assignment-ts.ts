import type { Call, TypeCall } from "../../tree";
import type { TreeNode } from "../../tree/tree-node";
import type { TypeAssignment } from "../../tree/type-assignment";
import { fromComplicated, GeneratedSnippets, GeneratorFixture } from "../generator";
import { contextType, GeneratorState } from "../generator-state";
import { generateCallTs } from "./call/generate-call-ts";
import { isSimpleNamed } from "./generate-simple-named-expression";
import { generateTypeCallTs } from "./generate-type-call-ts";

export function tryGenerateTypeAssignmentTs(node: TreeNode, state: GeneratorState, fixture: GeneratorFixture): void | GeneratedSnippets {
    if (node.type === "type-assignment") {
        return generateTypeAssignmentTs(node, state, fixture)
    }
}

export function generateTypeAssignmentTs(ta: TypeAssignment, state: GeneratorState, fixture: GeneratorFixture): GeneratedSnippets {
    const stdLibGenerated = fixture.standardLibrary.typeAssignmentGenerator(ta, state, fixture)
    if (stdLibGenerated) {
        return stdLibGenerated
    }

    const name = ta.variable.text
    const childState = state.makeChild({ context: contextType.isolatedExpression, isTypeContext: true })
    const typePart = generateTypePart(ta.call, childState, fixture, name)
    return fromComplicated(ta, [
        `const ${name} = undefined as unknown as `, typePart,
    ])
}

function generateTypePart(call: Call | TypeCall, state: GeneratorState, fixture: GeneratorFixture, name: string): GeneratedSnippets {
    const simpleTypeCallGenerated = handleSimpleTypeCall(call, state, fixture)
    if (simpleTypeCallGenerated) {
        return simpleTypeCallGenerated
    }
    const generatedCall = call.type === 'call' ? generateCallTs(call, state, fixture, name) : generateTypeCallTs(call, state, fixture, name)
    state.addPreStatementGenerator((s, f) => fromComplicated(call, [
        `function _${name}_Call() { return `, generatedCall, ` }`
    ]))
    return fromComplicated(call, [
        `ReturnType<typeof _${name}_Call>`,
    ])
}

function handleSimpleTypeCall(call: Call | TypeCall, state: GeneratorState, fixture: GeneratorFixture): GeneratedSnippets | void {
    if (call.type === "call") {
        return
    }
    const funcIsSimple = isSimpleNamed(call.func)
    const argsAreSimple = call.args.reduce((allSimple, a) => {
        return allSimple && isSimpleNamed(a)
    }, true)
    if (funcIsSimple && argsAreSimple) {
        return fixture.standardLibrary.simpleTypeCallGenerator(call, state, fixture)
    }
}
