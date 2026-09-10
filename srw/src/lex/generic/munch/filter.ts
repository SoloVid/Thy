import { Token } from "../token.ts"
import { Muncher } from "./muncher.ts"

export function filterMuncher<InputTokenKind extends string = string, OutputTokenKind extends InputTokenKind = InputTokenKind>(
  innerMuncher: Muncher<InputTokenKind>,
  tokenKindWhiteList: readonly OutputTokenKind[],
): Muncher<OutputTokenKind> {
  return (state) => {
    let match = innerMuncher(state)
    while (match && !tokenKindWhiteList.includes(match.kind as OutputTokenKind)) {
      match = innerMuncher(state)
    }
    return match as Token<OutputTokenKind> | null
  }
}
