import { nodeError, TreeNode } from '../../tree/tree-node'
import { makeGenerator } from '../generate-from-options'
import { DefiniteCodeGeneratorFuncNoFixture, fromToken, fromTokenRange, GeneratedSnippet, GeneratedSnippets, GeneratorResult } from '../generator'
import { makeGeneratorState } from '../generator-state'
import { assignmentGeneratorTs } from './assignment/generate-assignment-ts'
import { tryGenerateAtomTs } from './atom/generate-atom-ts'
import { tryGenerateBlockTs } from './block/generate-block-ts'
import { callGeneratorTs } from './call/generate-call-ts'
import { tryGenerateBlankLineTs } from './generate-blank-line-ts'
import { tryGenerateCommentTs } from './generate-comment-ts'
import { identifierGeneratorTs } from './generate-identifier-ts'
import { tryGenerateTypeAssignmentTs } from './generate-type-assignment-ts'
import { tryGenerateTypeCallTs } from './generate-type-call-ts'
import { letCallGeneratorTs } from './let/generate-let-call-ts'
import { standardLibraryGenerators } from './standard-library'

export function tsGenerator(node: TreeNode): GeneratorResult {
    const state = makeGeneratorState()
    const output: GeneratedSnippet[] = [generateTs2(node, state)].flat(Infinity)
    return {
        output: output.map(s => s.text).join(""),
        errors: state.errors
    }
}

const generateTs2: DefiniteCodeGeneratorFuncNoFixture<TreeNode> = (node, state) => {
    const fixture = {
        generate: generateTs2
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
        assignmentGeneratorTs(standardLibraryGenerators),
        tryGenerateAtomTs,
        tryGenerateBlankLineTs,
        tryGenerateBlockTs,
        callGeneratorTs(standardLibraryGenerators),
        tryGenerateCommentTs,
        identifierGeneratorTs(standardLibraryGenerators),
        tryGenerateTypeAssignmentTs,
        tryGenerateTypeCallTs,
        letCallGeneratorTs(standardLibraryGenerators),
    ]
)
