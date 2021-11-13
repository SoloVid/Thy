import { tMemberAccessOperator } from "../../tokenizer/token-type";
import type { Identifier } from "../../tree/identifier";
import type { TreeNode } from "../../tree/tree-node";
import { makeGenerator } from "../generate-from-options";
import { CodeGeneratorFunc, fromToken, GeneratedSnippet, GeneratedSnippets } from "../generator";
import type { GeneratorState } from "../generator-state";

export const tryGenerateIdentifierTs = makeIdentifierTsGenerator([

])

export function makeIdentifierTsGenerator(specializations: CodeGeneratorFunc<Identifier>[]): CodeGeneratorFunc<TreeNode> {
    return makeGenerator((node) => {
        if (node.type === "identifier") {
            return node
        }
    }, generateIdentifierTs, specializations)
}

function generateIdentifierTs(node: Identifier, state: GeneratorState): GeneratedSnippets {
    return node.rawTokens.map(t => {
        if (t.type === tMemberAccessOperator) {
            return fromToken(t, ".")
        }
        return fromToken(t)
    })
}
