import type { Atom } from "../../tree/atom";
import { nodeError, PropertyAccess, TreeNode } from "../../tree";
import { CodeGeneratorFunc, fromComplicated, fromNode, fromToken, GeneratedSnippets, GeneratorFixture } from "../generator";
import type { GeneratorState } from "../generator-state";
import { generateAtomTs } from "./atom/generate-atom-ts";
import { generatePropertyAccessTs } from "./generate-property-access-ts";
import type { ErrorableTreeNode } from "../../tree/tree-node";
import { makeGenerator } from "../generate-from-options";
import type { LibraryGeneratorCollection } from "../library-generator";

// export function typeInstanceGeneratorTs(standardLibrary: LibraryGeneratorCollection) {
//     return makeTypeInstanceTsGenerator([
//         standardLibrary.typeInstanceGenerator,
//     ])
// }

// export function makeTypeInstanceTsGenerator(specializations: CodeGeneratorFunc<Atom | PropertyAccess<never>>[]): CodeGeneratorFunc<TreeNode> {
//     return makeGenerator((node) => {
//         if (node.type === "atom" || node.type === "property-access") {
//             return node
//         }
//     }, generateTypeInstanceTs, specializations)
// }

export function checkAndGenerateTypeInstanceTs(node: ErrorableTreeNode, state: GeneratorState, fixture: GeneratorFixture): GeneratedSnippets {
    if (node.type !== "atom" && node.type !== "property-access") {
        state.addError(nodeError(node, "Expected type instance"))
        return fromNode(node, "unknown")
    }
    return generateTypeInstanceTs(node, state, fixture)
}

export function generateTypeInstanceTs(node: Atom | PropertyAccess<never>, state: GeneratorState, fixture: GeneratorFixture): GeneratedSnippets {
    const fromStandardLib = fixture.standardLibrary.typeInstanceGenerator(node, state, fixture)
    if (fromStandardLib !== undefined) {
        return fromStandardLib
    }

    if (node.type === "atom") {
        return [fromToken(node.token, "typeof "), generateAtomTs(node, state)]
    }
    return fromComplicated(node, ["typeof ", generatePropertyAccessTs(node, state, fixture)])
}
