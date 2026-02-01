import { fromToken } from "code-gen/utils/from-token.ts"
import type { Comment, TreeNode } from "tree"
import assert from "utils/assert.ts"
import { GeneratedSnippets } from "../../generator.ts"
import { makeIndent } from "../../utils/indent.ts"
import type { GeneratorState } from "../generator-state.ts"

export function tryGenerateCommentTs(
  node: TreeNode,
  state: GeneratorState,
): void | GeneratedSnippets {
  if (node.type === "comment") {
    return generateCommentTs(node, node.token.text, state)
  }
}

export function generateCommentTs(
  node: Comment,
  comment: string,
  state: GeneratorState,
): GeneratedSnippets {
  const lines = comment.split("\n")
  assert(lines.length > 0, "Comment should always have at least one line")
  if (lines.length === 1) {
    return fromToken(node.token, `// ${comment}`)
  }
  const lastLine = lines[lines.length - 1]
  const leadingSpaceMatch = /^ */.exec(lastLine)
  assert(leadingSpaceMatch !== null, "Unexpected regex match fail")
  const leadingSpace = leadingSpaceMatch[0]
  const leadingSpaceRegex = new RegExp(`^ {${leadingSpace.length}}`)
  return fromToken(
    node.token,
    "// " +
      lines
        .map((l) =>
          l.replace(leadingSpaceRegex, makeIndent(state.indentLevel) + "// "),
        )
        .join("\n"),
  )
}
