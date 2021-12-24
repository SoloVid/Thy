import type { Atom } from "../../../tree/atom";
import type { TreeNode } from "../../../tree/tree-node";
import { makeGenerator } from "../../generate-from-options";
import { CodeGeneratorFunc, fromToken } from "../../generator";

export const tryGenerateAtomTs = makeAtomTsGenerator([

])

export function makeAtomTsGenerator(specializations: CodeGeneratorFunc<Atom>[]): CodeGeneratorFunc<TreeNode> {
    return makeGenerator(node => {
        if (node.type === "atom") {
            return node
        }
    }, atom => [fromToken(atom.token, `${atom.token.text} as const`)], specializations)
}
