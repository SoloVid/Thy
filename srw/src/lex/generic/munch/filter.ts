import { TokenKind } from "@/lex/token-kind.ts"
import { Muncher } from "./muncher.ts"

export function filterMuncher(
  innerMuncher: Muncher,
  tokenKindWhiteList: readonly TokenKind[],
): Muncher {
  return (state) => {
    let match = innerMuncher(state)
    while (match && !tokenKindWhiteList.includes(match.kind)) {
      match = innerMuncher(state)
    }
    return match
  }
}
