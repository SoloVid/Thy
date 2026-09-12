export const tWhitespace = "Whitespace"
export const tStatementTerminator = "StatementTerminator"

// Semi-keywords
export const tReturn = "Return"

// Variable expressions
export const tNumber = "Number"

export type TokenKind =
  | typeof tWhitespace
  | typeof tStatementTerminator
  | typeof tReturn
  | typeof tNumber
