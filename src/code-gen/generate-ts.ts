import type { TreeNode } from '../tree/tree-node'
import { tryGenerateAssignmentTs } from './generate-assignment-ts'
import { tryGenerateAtomTs } from './generate-atom-ts'
import { tryGenerateBlankLineTs } from './generate-blank-line-ts'
import { tryGenerateBlockTs } from './generate-block-ts'
import { tryGenerateCallTs } from './generate-call-ts'
import { tryGenerateCommentTs } from './generate-comment-ts'
import { tryGenerateDefTs } from './generate-def-ts'
import { tryGenerateIdentifierTs } from './generate-identifier-ts'
import { tryGenerateTypeAssignmentTs } from './generate-type-assignment-ts'
import { tryGenerateTypeCallTs } from './generate-type-call-ts'
import { tryGenerateYieldCallTs } from './generate-yield-call-ts'
import type { CodeGeneratorFunc } from './generator'
import { GeneratorState, makeGeneratorState } from './generator-state'

const generators: CodeGeneratorFunc[] = [
    tryGenerateDefTs,

    tryGenerateAssignmentTs,
    tryGenerateAtomTs,
    tryGenerateBlankLineTs,
    tryGenerateBlockTs,
    tryGenerateCallTs,
    tryGenerateCommentTs,
    tryGenerateIdentifierTs,
    tryGenerateTypeAssignmentTs,
    tryGenerateTypeCallTs,
    tryGenerateYieldCallTs,
]

export function generateTs(node: TreeNode, state: GeneratorState = makeGeneratorState()): string {
    for (const generator of generators) {
        const outputCode = generator(node, state)
        if (outputCode !== undefined) {
            return outputCode
        }
    }

    return JSON.stringify(node)
}
