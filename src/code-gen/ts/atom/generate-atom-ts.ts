import type { Atom } from "../../../tree/atom";
import type { TreeNode } from "../../../tree/tree-node";
import { makeGenerator } from "../../generate-from-options";
import { CodeGeneratorFunc, fromToken, GeneratedSnippets } from "../../generator";
import { contextType, GeneratorState } from "../../generator-state";
import type { LibraryGeneratorCollection } from "../../library-generator";

export function atomGeneratorTs(standardLibrary: LibraryGeneratorCollection) {
    return makeAtomTsGenerator([
        standardLibrary.atomGenerator,
    ])
}

export function makeAtomTsGenerator(specializations: CodeGeneratorFunc<Atom>[]): CodeGeneratorFunc<TreeNode> {
    return makeGenerator(node => {
        if (node.type === "atom") {
            return node
        }
    }, generateAtomTs, specializations)
}

export function generateAtomTs(atom: Atom, state: GeneratorState): GeneratedSnippets {
    const isLiteral = !/^[A-Za-z]/.test(atom.token.text)
    if (state.context === contextType.looseExpression || !isLiteral) {
        return fromToken(atom.token, atom.token.text)
    }
    return fromToken(atom.token, `${atom.token.text} as const`)
}
