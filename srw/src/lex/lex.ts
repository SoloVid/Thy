import { lex as lexGeneric } from "./generic/lex.ts"
import type { LexResult } from "./generic/result.ts"
import { makeThyMuncher } from "./thy/muncher.ts"
import { type TokenKind, tStatementTerminator } from "./thy/token-kind.ts"

export function lex(source: string): LexResult<TokenKind> {
  const muncher = makeThyMuncher()
  const result = lexGeneric(source, muncher)
  result.tokens.push({
    kind: tStatementTerminator,
    offset: source.length,
    length: 0,
  })
  return result
}
