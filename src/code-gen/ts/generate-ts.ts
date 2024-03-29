import { nodeError, TreeNode } from '../../tree/tree-node'
import { makeGenerator } from '../generate-from-options'
import { fromToken, fromTokenRange, GeneratedSnippet, GeneratedSnippets, GeneratorResult } from '../generator'
import { ContextType, contextType, GeneratorState, makeGeneratorState } from '../generator-state'
import type { LibraryGeneratorCollection } from '../library-generator'
import { assignmentGeneratorTs } from './assignment/generate-assignment-ts'
import { atomGeneratorTs } from './atom/generate-atom-ts'
import { tryGenerateBlockTs } from './block/generate-block-ts'
import { callGeneratorTs } from './call/generate-call-ts'
import { tryGenerateBlankLineTs } from './generate-blank-line-ts'
import { tryGenerateCommentTs } from './generate-comment-ts'
import { propertyAccessGeneratorTs } from './generate-property-access-ts'
import { tryGenerateTypeAssignmentTs } from './generate-type-assignment-ts'
import { tryGenerateDanglingTypeCallTs } from './generate-type-call-ts'
import { letCallGeneratorTs } from './let/generate-let-call-ts'

export const tsGenerator = (standardLibrary: LibraryGeneratorCollection, topLevelContext?: ContextType) => (node: TreeNode): GeneratorResult => {
    const state = makeGeneratorState(undefined, { context: topLevelContext ?? contextType.blockAllowingExport })

    function generateTs2(node: TreeNode, state: GeneratorState) {
        const fixture = {
            generate: generateTs2,
            standardLibrary: standardLibrary,
        }
        return generateTs(node, state, fixture) as GeneratedSnippets
    }

    const generateTs = makeGenerator(
        (node) => node,
        (node, state) => {
            if (node.type === 'atom') {
                return fromToken(node.token, JSON.stringify(node))
            } else if (node.type !== "blank-line" && node.type !== "non-code") {
                state.addError(nodeError(node, "No code generation available"))
                return fromTokenRange(node, JSON.stringify(node))
            }
            return { text: JSON.stringify(node) }
        }, [
            assignmentGeneratorTs(standardLibrary),
            atomGeneratorTs(standardLibrary),
            tryGenerateBlankLineTs,
            tryGenerateBlockTs,
            callGeneratorTs(standardLibrary),
            tryGenerateCommentTs,
            propertyAccessGeneratorTs(standardLibrary),
            tryGenerateTypeAssignmentTs,
            tryGenerateDanglingTypeCallTs,
            letCallGeneratorTs(standardLibrary),
        ]
    )

    // There's an open issue in TS 4.7 about typing this correctly. https://github.com/microsoft/TypeScript/issues/49280
    const output: GeneratedSnippet[] = [generateTs2(node, state)].flat(Infinity as 1) as GeneratedSnippet[]
    return {
        output: output.map(s => s.text).join(""),
        errors: state.errors
    }
}