import type { Assignment } from './assignment'
import type { Atom } from './atom'
import type { BlankLine, Block } from './block'
import type { Call } from './call'
import type { Identifier } from './identifier'
import type { NonCode } from './non-code'
import type { TypeAssignment } from './type-assignment'
import type { TypeCall } from './type-call'
import type { YieldCall } from './yield-call'

export type TreeNode = Assignment | Atom | BlankLine | Block | Call | Identifier | NonCode | TypeAssignment | TypeCall | YieldCall
