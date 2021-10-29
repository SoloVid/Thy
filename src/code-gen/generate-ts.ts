import { TreeNode } from '../tree/tree-node'
import { tryGenerateAssignmentTs } from './generate-assignment-ts'
import { tryGenerateAtomTs } from './generate-atom-ts'
import { tryGenerateBlankLineTs } from './generate-blank-line-ts'
import { generateBlockTs, tryGenerateBlockTs } from './generate-block-ts'
import { generateCallTs, tryGenerateCallTs } from './generate-call-ts'
import { tryGenerateCommentTs } from './generate-comment-ts'
import { tryGenerateTypeAssignmentTs } from './generate-type-assignment-ts'
import { tryGenerateTypeCallTs } from './generate-type-call-ts'
import { tryGenerateYieldCallTs } from './generate-yield-call-ts'
import { CodeGenerator, CodeGeneratorFunc } from './generator'
import type { GeneratorState } from './generator-state'

const generators: CodeGeneratorFunc[] = [
    tryGenerateAssignmentTs,
    tryGenerateAtomTs,
    tryGenerateBlankLineTs,
    tryGenerateBlockTs,
    tryGenerateCallTs,
    tryGenerateCommentTs,
    tryGenerateTypeAssignmentTs,
    tryGenerateTypeCallTs,
    tryGenerateYieldCallTs,
]

export function generateTs(node: TreeNode, state: GeneratorState = { indentLevel: 0 }): string {
    for (const generator of generators) {
        const outputCode = generator(node, state)
        if (outputCode !== undefined) {
            return outputCode
        }
    }
    // if (node.type === "block") {
    //     return generateBlockTs(node, state)
    // }
    // if (node.type === "call") {
    //     return generateCallTs(node, state)
    // }

    return JSON.stringify(node)
}