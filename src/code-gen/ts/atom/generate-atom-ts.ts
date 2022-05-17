import type { Atom } from "../../../tree/atom";
import { nodeError, TreeNode } from "../../../tree/tree-node";
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
    const isIdentifier = /^[A-Za-z]/.test(atom.token.text)
    if (isIdentifier) {
        if (atom.symbolTable.getSymbolInfo(atom.token.text) === null) {
            if (!state.implicitArguments) {
                state.addError(nodeError(atom, `${atom.token.text} is not defined locally and there is no target for implicit arguments in this scope`))
            } else {
                state.implicitArguments.markImplicitArgumentUsed()
                return fromToken(atom.token, `${state.implicitArguments.variableName}.${atom.token.text}`)
            }
        }
        return fromToken(atom.token, atom.token.text)
    }
    if (state.context === contextType.looseExpression) {
        return fromToken(atom.token, atom.token.text)
    }
    return fromToken(atom.token, `${atom.token.text} as const`)
}
