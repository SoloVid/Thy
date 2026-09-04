export const tWhitespace = "Whitespace"

// Semi-keywords
export const tReturn = "Return"

// Variable expressions
export const tNumber = "Number"

export type TokenKind = typeof tWhitespace | typeof tReturn | typeof tNumber
