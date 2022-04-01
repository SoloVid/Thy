import { Token } from "../../tokenizer/token";
import { tMemberAccessOperator } from "../../tokenizer/token-type";
import type { Identifier } from "../../tree/identifier";
import type { TreeNode } from "../../tree/tree-node";
import { makeGenerator } from "../generate-from-options";
import { CodeGeneratorFunc, fromToken, GeneratedSnippets } from "../generator";
import type { GeneratorState } from "../generator-state";
import { standardLibraryGenerators } from "./standard-library";

export const tryGenerateIdentifierTs = makeIdentifierTsGenerator([
    standardLibraryGenerators.valueGenerator,
])

export function makeIdentifierTsGenerator(specializations: CodeGeneratorFunc<Identifier>[]): CodeGeneratorFunc<TreeNode> {
    return makeGenerator((node) => {
        if (node.type === "identifier") {
            return node
        }
    }, generateIdentifierTs, specializations)
}

function generateIdentifierTs(node: Identifier, state: GeneratorState): GeneratedSnippets {
    return generateTsFromIdentifierRawTokens(node.rawTokens)
}
export function generateTsFromIdentifierRawTokens(rawTokens: Token[]): GeneratedSnippets {
    return rawTokens.map(t => {
        if (t.type === tMemberAccessOperator) {
            return fromToken(t, ".")
        }
        return fromToken(t)
    })
}
