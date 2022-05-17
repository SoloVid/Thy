import { tConstDeclAssign, tVarDeclAssign } from "../../../tokenizer/token-type";
import type { Assignment } from "../../../tree/assignment";
import type { TreeNode } from "../../../tree/tree-node";
import { makeGenerator } from "../../generate-from-options";
import { CodeGeneratorFunc, fromTokenRange, GeneratedSnippets, GeneratorFixture } from "../../generator";
import { contextType, GeneratorState } from "../../generator-state";
import type { LibraryGeneratorCollection } from "../../library-generator";

export function assignmentGeneratorTs(standardLibrary: LibraryGeneratorCollection) {
    return makeTryGenerateAssignmentTs([
        standardLibrary.assignmentGenerator,
    ])
}

export function makeTryGenerateAssignmentTs(specializations: CodeGeneratorFunc<Assignment>[]): CodeGeneratorFunc<TreeNode> {
    return makeGenerator((node) => {
        if (node.type === "assignment") {
            return node
        }
    }, generateAssignmentTs, specializations)
}

export function generateAssignmentTs(a: Assignment, state: GeneratorState, fixture: GeneratorFixture): GeneratedSnippets {
    const callTs = fixture.generate(a.call, state.makeChild({ context: contextType.isolatedExpression }))
    return generateAssignmentTs2(a, state, fixture, callTs)
}

export function generateAssignmentTs2(a: Assignment, state: GeneratorState, fixture: GeneratorFixture, expressionTs: GeneratedSnippets, typeTs?: GeneratedSnippets): GeneratedSnippets {
    const variablePart = fixture.generate(a.variable, state)
    const variableTypePart = typeTs ? [variablePart, fromTokenRange(a, ": "), typeTs] : [variablePart]
    const assignPart = [variableTypePart, fromTokenRange(a, " = "), expressionTs]
    if (a.operator.type === tConstDeclAssign) {
        return [fromTokenRange(a, "const "), assignPart]
    }
    if (a.operator.type === tVarDeclAssign) {
        return [fromTokenRange(a, "let "), assignPart]
    }
    return assignPart
}
