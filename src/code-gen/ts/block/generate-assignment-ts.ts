import {
  CodeGeneratorFunc,
  GeneratorFixture,
} from "code-gen/ts/ts-generator.ts"
import { fromTokenRange } from "code-gen/utils/from-token-range.ts"
import { type Assignment, isAssignment } from "../../../tree/assignment.ts"
import type { TreeNode } from "../../../tree/tree-node.ts"
import { makeGenerator } from "../generate-from-options.ts"
import { GeneratedSnippets } from "../../generator.ts"
import { GeneratorState } from "../generator-state.ts"
import { contextType } from "../generator-context.ts"
import type { LibraryGeneratorCollection } from "../library-generator.ts"
import {
  generateGivenCallTs,
  generateGivenCallTsWithParameterName,
} from "../call/generate-given-call-ts.ts"
import { trace } from "../utils/debug.ts"
import { nodeToString } from "code-gen/utils/to-string.ts"

export function assignmentGeneratorTs(
  standardLibrary: LibraryGeneratorCollection,
) {
  return makeTryGenerateAssignmentTs([standardLibrary.assignmentGenerator])
}

export function makeTryGenerateAssignmentTs(
  specializations: CodeGeneratorFunc<Assignment>[],
): CodeGeneratorFunc<TreeNode> {
  return makeGenerator(
    (node) => {
      if (isAssignment(node)) {
        return node
      }
    },
    generateAssignmentTs,
    specializations,
  )
}

export function generateAssignmentTs(
  a: Assignment,
  state: GeneratorState,
  fixture: GeneratorFixture,
  expressionTsPreGenerated?: GeneratedSnippets,
  typeTs?: GeneratedSnippets,
): GeneratedSnippets {
  trace(`generateAssignmentTs() <= ${nodeToString(a)}`)
  function generateValueExpression(): GeneratedSnippets {
    if (expressionTsPreGenerated) {
      return expressionTsPreGenerated
    }
    const childState = state.makeChild({
      context: contextType.isolatedExpression,
    })
    if (
      a.call.type === "given-call" &&
      a.variable.type === "value-identifier"
    ) {
      return generateGivenCallTsWithParameterName(
        a.call,
        childState,
        fixture,
        `_${a.variable.token.text}`,
      )
    }
    return fixture.generate(a.call, childState)
  }

  const expressionTs = generateValueExpression()
  const variablePart = fixture.generate(a.variable, state)
  const variableTypePart = typeTs
    ? [variablePart, fromTokenRange(a, ": "), typeTs]
    : [variablePart]
  const assignPart = [variableTypePart, fromTokenRange(a, " = "), expressionTs]
  if (a.type === "constant-declaration") {
    return [fromTokenRange(a, "const "), assignPart]
  }
  if (a.type === "variable-declaration") {
    return [fromTokenRange(a, "let "), assignPart]
  }
  return assignPart
}
