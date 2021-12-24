import type { TreeNode } from '../../tree/tree-node'
import { makeGenerator } from '../generate-from-options'
import { DefiniteCodeGeneratorFunc, fromToken, fromTokenRange, GeneratedSnippet, GeneratorResult } from '../generator'
import { makeGeneratorState } from '../generator-state'
import { tryGenerateAtomTs } from './atom/generate-atom-ts'
import { tryGenerateCallTs } from './call/generate-call-ts'
import { tryGenerateAssignmentTs } from './assignment/generate-assignment-ts'
import { tryGenerateBlankLineTs } from './generate-blank-line-ts'
import { tryGenerateBlockTs } from './block/generate-block-ts'
import { tryGenerateCommentTs } from './generate-comment-ts'
import { tryGenerateIdentifierTs } from './generate-identifier-ts'
import { tryGenerateTypeAssignmentTs } from './generate-type-assignment-ts'
import { tryGenerateTypeCallTs } from './generate-type-call-ts'
import { tryGenerateLetCallTs } from './let/generate-let-call-ts'

export function tsGenerator(node: TreeNode): GeneratorResult {
    const state = makeGeneratorState()
    const output: GeneratedSnippet[] = [generateTs(node, state)].flat(Infinity)
    return {
        output: output.map(s => s.text).join(""),
        errors: state.errors
    }
}

export const generateTs = makeGenerator(
    (node) => node,
    (node) => {
        if (node.type === 'atom') {
            return fromToken(node.token, JSON.stringify(node))
        } else if (node.type !== "blank-line" && node.type !== "non-code") {
            return fromTokenRange(node, JSON.stringify(node))
        }
        return { text: JSON.stringify(node) }
    }, [
        tryGenerateAssignmentTs,
        tryGenerateAtomTs,
        tryGenerateBlankLineTs,
        tryGenerateBlockTs,
        tryGenerateCallTs,
        tryGenerateCommentTs,
        tryGenerateIdentifierTs,
        tryGenerateTypeAssignmentTs,
        tryGenerateTypeCallTs,
        tryGenerateLetCallTs,
    ]
) as DefiniteCodeGeneratorFunc<TreeNode>
