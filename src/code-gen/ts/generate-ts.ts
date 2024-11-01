import { nodeError } from "common/compile-error"
import { TreeNode } from "tree"
import { makeGenerator } from "../generate-from-options"
import {
  GeneratedSnippet,
  GeneratedSnippets,
  GeneratorResult,
} from "../generator"
import {
  ContextType,
  contextType,
  GeneratorState,
  makeGeneratorState,
} from "../generator-state"
import type { LibraryGeneratorCollection } from "../library-generator"
import { fromNode } from "../utils/from-node"
import { assignmentGeneratorTs } from "./assignment/generate-assignment-ts"
import { tryGenerateBlockTs } from "./block/generate-block-ts"
import { callGeneratorTs } from "./call/generate-call-ts"
import { tryGenerateBlankLineTs } from "./generate-blank-line-ts"
import { tryGenerateCommentTs } from "./generate-comment-ts"
import { propertyAccessGeneratorTs } from "./generate-property-access-ts"
import { tryGenerateTypeAssignmentTs } from "./type/generate-type-assignment-ts"
import { tryGenerateDanglingTypeCallTs } from "./type/generate-type-call-ts"
import { letCallGeneratorTs } from "./let/generate-let-call-ts"
import { tryGenerateNumberTs } from "./term/generate-number-ts"
import { tryGenerateStringTs } from "./term/generate-string-ts"
import { valueIdentifierGeneratorTs } from "./term/generate-value-identifier-ts"
import { autoTightS } from "./utils/auto-tight"

export const tsGenerator =
  (
    standardLibrary: LibraryGeneratorCollection,
    topLevelContext?: ContextType,
  ) =>
  (node: TreeNode): GeneratorResult => {
    const state = makeGeneratorState(undefined, {
      context: topLevelContext ?? contextType.blockAllowingReturn,
    })

    function generateTsWithSelfFixture(node: TreeNode, state: GeneratorState) {
      const fixture = {
        generate: generateTsWithSelfFixture,
        standardLibrary: standardLibrary,
      }
      return generateTs(node, state, fixture) as GeneratedSnippets
    }

    const generateTs = makeGenerator(
      (node) => node,
      (node, state) => {
        // It *should* be impossible to hit this case if all specializations
        // are all correctly implemented and added to the specialization list.
        state.addError(
          nodeError(
            node,
            `No code generation available for node of kind ${node.type}`,
          ),
        )
        return fromNode(node, autoTightS(state, `void ${JSON.stringify(node)}`))
      },
      [
        // Ordered from simplest to most complex.
        tryGenerateBlankLineTs,
        tryGenerateCommentTs,
        tryGenerateNumberTs,
        tryGenerateStringTs,
        valueIdentifierGeneratorTs(standardLibrary),
        propertyAccessGeneratorTs(standardLibrary),
        callGeneratorTs(standardLibrary),
        tryGenerateDanglingTypeCallTs,
        letCallGeneratorTs(standardLibrary),
        assignmentGeneratorTs(standardLibrary),
        tryGenerateTypeAssignmentTs,
        tryGenerateBlockTs,
      ],
    )

    // There's an open issue in TS 4.7 about typing this correctly. https://github.com/microsoft/TypeScript/issues/49280
    const output: GeneratedSnippet[] = [generateTsWithSelfFixture(node, state)].flat(
      Infinity as 1,
    ) as GeneratedSnippet[]
    return {
      output: output.map((s) => s.text).join(""),
      errors: state.errors,
    }
  }
