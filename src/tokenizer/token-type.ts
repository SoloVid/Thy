export const tErrorToken = "ErrorToken"

export const tEndStream = "EndStream"

export const tEndBlock = "EndBlock"
export const tStartBlock = "StartBlock"
export const tStatementContinuation = "StatementContinuation"
export const tStatementTerminator = "StatementTerminator"
export const tComment = "Comment"

// Keywords
export const tConstDeclAssign = "ConstDeclAssign"
export const tVarDeclAssign = "VarDeclAssign"
export const tNoDeclAssign = "NoDeclAssign"
export const tExport = "Export"
export const tPrivate = "Private"
export const tType = "Type"
export const tLet = "Let"

// Semi-keywords
export const tAwait = "Await"
export const tGiven = "Given"
export const tReturn = "Return"
export const tThat = "That"
export const tTypeGiven = "TypeGiven"

export const tMemberAccessOperator = "MemberAccessOperator"

export const tStartString = "StartString"
export const tEndString = "EndString"
export const tStringText = "StringText"
export const tStartStringInterpolation = "StartStringInterpolation"
export const tEndStringInterpolation = "EndStringInterpolation"

// Variable expressions
export const tNumberLiteral = "NumberLiteral"
export const tTypeIdentifier = "TypeIdentifier"
export const tValueIdentifier = "ValueIdentifier"

export type TokenType =
  | typeof tErrorToken
  | typeof tEndStream
  | typeof tEndBlock
  | typeof tStartBlock
  | typeof tStatementContinuation
  | typeof tStatementTerminator
  | typeof tComment
  | typeof tConstDeclAssign
  | typeof tVarDeclAssign
  | typeof tNoDeclAssign
  | typeof tExport
  | typeof tPrivate
  | typeof tType
  | typeof tLet
  | typeof tAwait
  | typeof tGiven
  | typeof tReturn
  | typeof tThat
  | typeof tTypeGiven
  | typeof tMemberAccessOperator
  | typeof tStartString
  | typeof tEndString
  | typeof tStringText
  | typeof tStartStringInterpolation
  | typeof tEndStringInterpolation
  | typeof tNumberLiteral
  | typeof tTypeIdentifier
  | typeof tValueIdentifier
