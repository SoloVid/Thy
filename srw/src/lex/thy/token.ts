import { Token as GenericToken } from "../generic/token.ts"
import { TokenKind } from "./token-kind.ts"

export type Token = GenericToken<TokenKind>
