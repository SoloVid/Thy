import { fromNode } from "code-gen/utils/from-node"
import { nodeError } from "common/compile-error"
import { TreeNode } from "tree"
import { CodeGeneratorFunc, DefiniteCodeGeneratorFunc } from "../ts-generator"
import { autoTightS } from "./auto-tight"

export function makeGeneratorForced<T extends TreeNode>(
  generator: CodeGeneratorFunc<T>,
): DefiniteCodeGeneratorFunc<T> {
  return (node, state, fixture) => {
    const maybeResult = generator(node, state, fixture)
    if (maybeResult) {
      return maybeResult
    }
    state.addError(
      nodeError(
        node,
        `No code generation available for node of kind ${node.type}`,
      ),
    )
    return fromNode(node, autoTightS(state, `void ${JSON.stringify(node)}`))
  }
}
