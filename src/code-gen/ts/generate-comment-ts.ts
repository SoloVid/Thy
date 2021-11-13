import assert from "assert";
import { tComment } from "../../tokenizer/token-type";
import { NonCode } from "../../tree/non-code";
import type { TreeNode } from "../../tree/tree-node";
import { fromToken, fromTokenRange, GeneratedSnippets } from "../generator";
import type { GeneratorState } from "../generator-state";
import { makeIndent } from "../indent-string";

export function tryGenerateCommentTs(node: TreeNode, state: GeneratorState): void | GeneratedSnippets {
    if (node.type === "non-code") {
        if (node.token.type === tComment) {
            return generateCommentTs(node, node.token.text, state)
        }
    }
}

export function generateCommentTs(node: NonCode, comment: string, state: GeneratorState): GeneratedSnippets {
    const lines = comment.split("\n")
    assert(lines.length > 0)
    if (lines.length === 1) {
        return fromToken(node.token, `// ${comment}`)
    }
    const lastLine = lines[lines.length - 1]
    const leadingSpaceMatch = /^ */.exec(lastLine)
    assert(leadingSpaceMatch !== null)
    const leadingSpace = leadingSpaceMatch[0]
    const leadingSpaceRegex = new RegExp(`^ {${leadingSpace.length}}`)
    return fromToken(node.token, "// " + lines.map(l => l.replace(leadingSpaceRegex, makeIndent(state.indentLevel) + "// ")).join("\n"))
}
