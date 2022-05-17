import type { Token } from "../../tokenizer/token";
import { tMemberAccessOperator } from "../../tokenizer/token-type";
import type { PropertyAccess } from "../../tree";
import type { TreeNode } from "../../tree/tree-node";
import { makeGenerator } from "../generate-from-options";
import { CodeGeneratorFunc, fromToken, GeneratedSnippets, GeneratorFixture } from "../generator";
import type { GeneratorState } from "../generator-state";
import type { LibraryGeneratorCollection } from "../library-generator";

export function propertyAccessGeneratorTs(standardLibrary: LibraryGeneratorCollection) {
    return makePropertyAccessTsGenerator([
        standardLibrary.propertyAccessGenerator,
    ])
}

export function makePropertyAccessTsGenerator(specializations: CodeGeneratorFunc<PropertyAccess>[]): CodeGeneratorFunc<TreeNode> {
    return makeGenerator((node) => {
        if (node.type === "property-access") {
            return node
        }
    }, generatePropertyAccessTs, specializations)
}

export function generatePropertyAccessTs(node: PropertyAccess, state: GeneratorState, fixture: GeneratorFixture): GeneratedSnippets {
    const baseGenerated = fixture.generate(node.base, state)
    const tailGenerated = fillOutPropertyAccessExpression([node.memberAccessOperatorToken, node.property])
    return [baseGenerated, tailGenerated]
}

export function fillOutPropertyAccessExpression(trailingTokens: readonly Token[]): GeneratedSnippets {
    return trailingTokens.map(t => {
        if (t.type === tMemberAccessOperator) {
            return fromToken(t, ".")
        }
        return fromToken(t)
    })
}
