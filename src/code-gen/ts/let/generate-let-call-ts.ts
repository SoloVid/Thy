import type { LetCall } from "../../../tree/let-call";
import type { TreeNode } from "../../../tree/tree-node";
import { makeGenerator } from "../../generate-from-options";
import { CodeGeneratorFunc, fromComplicated, GeneratedSnippets, GeneratorFixture } from "../../generator";
import { contextType, GeneratorState } from "../../generator-state";
import { makeIndent } from "../../indent-string";
import { LibraryGeneratorCollection } from "../../library-generator";

export function letCallGeneratorTs(standardLibrary: LibraryGeneratorCollection) {
    return makeLetTsGenerator([
        standardLibrary.letCallGenerator,
    ])
}

export function makeLetTsGenerator(specializations: CodeGeneratorFunc<LetCall>[]): CodeGeneratorFunc<TreeNode> {
    return makeGenerator((node) => {
        if (node.type === "let-call") {
            return node
        }
    }, generateLetCallTs, specializations)
}

export function generateLetCallTs(letCall: LetCall, state: GeneratorState, fixture: GeneratorFixture): GeneratedSnippets {
    const captureVar = state.getUniqueVariableName()
    const callTs = fixture.generate(letCall.call, state.makeChild({ context: contextType.isolatedExpression }))
    return fromComplicated(letCall, [
        "const ", captureVar, " = ", callTs, "\n",
        makeIndent(state.indentLevel), "if (", captureVar, " !== undefined) {\n",
        makeIndent(state.indentLevel + 1), "return ", captureVar, "\n",
        makeIndent(state.indentLevel), "}\n",
    ])
}
