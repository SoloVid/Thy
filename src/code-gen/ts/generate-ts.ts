import { nodeToString } from "code-gen/utils/to-string"
import { nodeError } from "common/compile-error"
import type { TreeNode } from "tree"
import type {
  GeneratedSnippet,
  GeneratedSnippets,
  GeneratorResult,
} from "../generator"
import { fromNode } from "../utils/from-node"
import { assignmentGeneratorTs } from "./block/generate-assignment-ts"
import { tryGenerateBlankLineTs } from "./block/generate-blank-line-ts"
import { tryGenerateBlockTs } from "./block/generate-block-ts"
import { tryGenerateCommentTs } from "./block/generate-comment-ts"
import { letCallGeneratorTs } from "./block/generate-let-call-ts"
import { tryGenerateAwaitCallTs } from "./call/generate-await-call-ts"
import { valueCallGeneratorTs } from "./call/generate-call-ts"
import { tryGenerateGivenCallTs } from "./call/generate-given-call-ts"
import { tryGenerateReturnTs } from "./call/generate-return-ts"
import { tryGenerateSpecialVanillaCallTs } from "./call/generate-special-vanilla-call-ts"
import { tryGenerateNumberTs } from "./expression/generate-number-ts"
import {
  typePropertyAccessGeneratorTs,
  valuePropertyAccessGeneratorTs,
} from "./expression/generate-property-access-ts"
import {
  tryGenerateStringTs,
  tryGenerateStringTypeTs,
} from "./expression/generate-string-ts"
import {
  typeIdentifierGeneratorTs,
  typeIdentifierGeneratorTypeTs,
} from "./expression/generate-type-identifier-ts"
import { valueIdentifierGeneratorTs } from "./expression/generate-value-identifier-ts"
import {
  makeGenerator,
  makeGeneratorWithFixtureSideCar,
} from "./generate-from-options"
import { contextType } from "./generator-context"
import { GeneratorState, makeGeneratorState } from "./generator-state"
import type { LibraryGeneratorCollection } from "./library-generator"
import type { GeneratorFixture } from "./ts-generator"
import { generateExpressionAsTypeTs } from "./type/generate-expression-as-type-ts"
import { typeAssignmentGeneratorTs } from "./type/generate-type-assignment-ts"
import {
  typeCallGeneratorTs,
  typeCallGeneratorTypeTs,
} from "./type/generate-type-call-ts"
import { tryGenerateTypeGivenCallTs } from "./type/generate-type-given-call-ts"
import { autoTightS } from "./utils/auto-tight"
import { trace } from "./utils/debug"

export const tsGenerator =
  (
    standardLibrary: LibraryGeneratorCollection,
    preludeContent: string,
    endingContent: string,
    indent: boolean = false,
  ) =>
  (node: TreeNode): GeneratorResult => {
    const rootState = makeGeneratorState(undefined, {
      context: contextType.looseExpression,
      increaseIndent: indent,
    })

    function generateTsWithSelfFixture(node: TreeNode, state: GeneratorState) {
      const fixture: GeneratorFixture = {
        generate: generateTsWithSelfFixture,
        generateAsType: makeGeneratorWithFixtureSideCar(
          () => fixture,
          (node) => node,
          (node, state) => {
            trace(`generateAsType() <= ${nodeToString(node)}`)
            // console.log(state)
            return generateExpressionAsTypeTs(node, state, fixture)
          },
          [
            tryGenerateStringTypeTs,
            typeIdentifierGeneratorTypeTs(standardLibrary),
            typeCallGeneratorTypeTs(standardLibrary),
            tryGenerateTypeGivenCallTs,
          ],
        ),
        standardLibrary,
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
        valuePropertyAccessGeneratorTs(standardLibrary),
        typeIdentifierGeneratorTs(standardLibrary),
        typePropertyAccessGeneratorTs(standardLibrary),
        tryGenerateAwaitCallTs,
        tryGenerateGivenCallTs,
        tryGenerateSpecialVanillaCallTs,
        valueCallGeneratorTs(standardLibrary),
        typeCallGeneratorTs(standardLibrary),
        tryGenerateTypeGivenCallTs,
        tryGenerateReturnTs,
        letCallGeneratorTs(standardLibrary),
        assignmentGeneratorTs(standardLibrary),
        typeAssignmentGeneratorTs(standardLibrary),
        tryGenerateBlockTs,
      ],
    )

    // There's an open issue in TS 4.7 about typing this correctly. https://github.com/microsoft/TypeScript/issues/49280
    const output: GeneratedSnippet[] = [
      generateTsWithSelfFixture(node, rootState),
    ].flat(Infinity as 1) as GeneratedSnippet[]
    return {
      output:
        preludeContent +
        output
          .map((s) => s.text)
          .join("")
          .trimEnd() +
        endingContent,
      errors: rootState.errors,
    }
  }
