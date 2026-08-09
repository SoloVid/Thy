import type { Idea } from "./idea.ts"

export interface Block {
  readonly type: "block"
  readonly ideas: readonly Idea[]
}
