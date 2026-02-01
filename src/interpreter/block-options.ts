import { ThyBlockContext } from "./types.ts"

export type BlockOptions = {
  closure: Record<string, unknown>
  functionName?: string
  stackTracePath: ThyBlockContext["stackTracePath"]
  thyResolutionRelativePath: ThyBlockContext["thyResolutionRelativePath"]
  resolveThy: ThyBlockContext["resolveThy"]
  additionalTraceLinesToHide?: number
}
