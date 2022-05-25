import type { MappedGeneratedSnippet } from '../code-gen/generator'
import { CompileError, tokenError } from '../compile-error'
import type { Assignment } from './assignment'
import type { Atom } from './atom'
import type { BlankLine, Block } from './block'
import type { Call } from './call'
import type { NonCode } from './non-code'
import type { TypeAssignment } from './type-assignment'
import type { TypeCall } from './type-call'
import type { LetCall } from './let-call'
import type { PropertyAccess } from './property-access'

export type TreeNode = Assignment | Atom | BlankLine | Block | Call | NonCode | PropertyAccess | TypeAssignment | TypeCall | LetCall

export type ErrorableTreeNode = Exclude<TreeNode, BlankLine | NonCode>

export function nodeError(node: ErrorableTreeNode, message: string): CompileError {
    if (node.type === "atom") {
        return tokenError(node.token, message)
    }
    return {
        message,
        start: node.firstToken,
        end: node.lastToken
    }
}
