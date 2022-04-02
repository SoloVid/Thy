import type { Atom } from "../../../tree/atom";
import type { TreeNode } from "../../../tree/tree-node";
import { makeGenerator } from "../../generate-from-options";
import { CodeGeneratorFunc, fromToken } from "../../generator";
import { contextType } from "../../generator-state";

export const tryGenerateAtomTs = makeAtomTsGenerator([

])

export function makeAtomTsGenerator(specializations: CodeGeneratorFunc<Atom>[]): CodeGeneratorFunc<TreeNode> {
    return makeGenerator(node => {
        if (node.type === "atom") {
            return node
        }
    }, (atom, state) => {
        if (state.context === contextType.looseExpression) {
            return fromToken(atom.token, atom.token.text)
        }
        return fromToken(atom.token, `${atom.token.text} as const`)
    }, specializations)
}
