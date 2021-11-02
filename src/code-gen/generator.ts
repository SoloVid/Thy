import type { TreeNode } from "../tree/tree-node";
import type { GeneratorState } from "./generator-state";

export type CodeGeneratorFunc = (node: TreeNode, state: GeneratorState) => void | string

export interface CodeGenerator<InputNodeType extends TreeNode> {
    isMatch(node: TreeNode): boolean
    generate(node: TreeNode, state: GeneratorState): void | string
}
