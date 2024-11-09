import { CodeGeneratorFunc, GeneratorFixture } from "code-gen/ts/ts-generator"
import { fromTokenRange } from "code-gen/utils/from-token-range"
import { isAssignment, type Assignment } from "../../../tree/assignment"
import type { TreeNode } from "../../../tree/tree-node"
import { makeGenerator } from "../generate-from-options"
import { GeneratedSnippets } from "../../generator"
import { GeneratorState } from "../generator-state"
import { contextType } from "../generator-context"
import type { LibraryGeneratorCollection } from "../library-generator"
import {
  generateGivenCallTs,
  generateGivenCallTsWithParameterName,
} from "../call/generate-given-call-ts"

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
