import assert from "assert";
import { tComment } from "../tokenizer/token-type";
import type { TreeNode } from "../tree/tree-node";
import type { GeneratorState } from "./generator-state";
import { makeIndent } from "./indent-string";

export function tryGenerateCommentTs(node: TreeNode, state: GeneratorState): void | string {
    if (node.type === "non-code") {
        if (node.token.type === tComment) {
            return generateCommentTs(node.token.text, state)
            // return `// ${node.token.text}`
        }
    }
}

export function generateCommentTs(comment: string, state: GeneratorState): string {
    const lines = comment.split("\n")
    assert(lines.length > 0)
    if (lines.length === 1) {
        return `// ${comment}`
    }
    const lastLine = lines[lines.length - 1]
    const leadingSpaceMatch = /^ */.exec(lastLine)
    assert(leadingSpaceMatch !== null)
    const leadingSpace = leadingSpaceMatch[0]
    const leadingSpaceRegex = new RegExp(`^ {${leadingSpace.length}}`)
    return "// " + lines.map(l => l.replace(leadingSpaceRegex, makeIndent(state.indentLevel) + "// ")).join("\n")
    // return lines.map(l => l.replace(leadingSpaceRegex, makeIndent(state.indentLevel) + "// ")).map(l => `// ${l}`).join("\n")
}
