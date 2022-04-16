import assert from "assert";
import type { TreeNode } from "../../../../tree/tree-node";

export function ensureStringLiteral(node: TreeNode): string | null {
    if (node.type !== "atom" || !/^"[^"]*"$/.test(node.token.text)) {
        return null
    }

    const referencedName = JSON.parse(node.token.text)
    assert(typeof referencedName === "string")
    return referencedName
}
