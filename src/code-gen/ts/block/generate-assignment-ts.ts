import { CodeGeneratorFunc, GeneratorFixture } from "code-gen/ts/ts-generator"
import { fromTokenRange } from "code-gen/utils/from-token-range"
import { isAssignment, type Assignment } from "../../../tree/assignment"
import type { TreeNode } from "../../../tree/tree-node"
import { makeGenerator } from "../generate-from-options"
import {
  GeneratedSnippets,
} from "../../generator"
import { contextType, GeneratorState } from "../generator-state"
import type { LibraryGeneratorCollection } from "../library-generator"

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
  const expressionTs =
    expressionTsPreGenerated ??
    fixture.generate(
      a.call,
      state.makeChild({ context: contextType.isolatedExpression }),
    )
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
