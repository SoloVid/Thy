import type { TokenRange } from "common"
import type { MappedGeneratedSnippet } from "../generator"

export function fromTokenRange(
  range: TokenRange,
  text: string,
): MappedGeneratedSnippet {
  return {
    text,
    sourceFirstToken: range.firstToken,
    sourceLastToken: range.lastToken,
  }
}
