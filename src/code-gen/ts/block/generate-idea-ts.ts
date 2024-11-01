import { TreeNode } from "tree"
import { tryGeneratorOptions } from "../generate-from-options"
import {
  GeneratedSnippets
} from "../../generator"
import { GeneratorFixture } from "../ts-generator"
import { assignmentGeneratorTs } from "./generate-assignment-ts"
import { valueCallGeneratorTs } from "../call/generate-call-ts"
import { tryGenerateReturnTs } from "../call/generate-return-ts"
import { tryGenerateBlankLineTs } from "./generate-blank-line-ts"
import { tryGenerateCommentTs } from "./generate-comment-ts"
import {
  GeneratorState
} from "../generator-state"
import { letCallGeneratorTs } from "./generate-let-call-ts"
import { tryGenerateTypeAssignmentTs } from "../type/generate-type-assignment-ts"

/**
 * @deprecated not sure I actually want to go down this specialization path yet
 */
export function tryGenerateIdeaTs(
  node: TreeNode,
  state: GeneratorState,
  fixture: GeneratorFixture,
): GeneratedSnippets | void {
  return tryGeneratorOptions(
    node,
    state,
    fixture,
    [
      // Ordered from simplest to most complex.
      tryGenerateBlankLineTs,
      tryGenerateCommentTs,
      valueCallGeneratorTs(fixture.standardLibrary),
      tryGenerateReturnTs,
      // TODO: Add type return
      letCallGeneratorTs(fixture.standardLibrary),
      assignmentGeneratorTs(fixture.standardLibrary),
      tryGenerateTypeAssignmentTs,
    ]
  )
}
