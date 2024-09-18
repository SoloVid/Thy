import type { Token } from "../tokenizer/token"
import type {
  tAwait,
  tGiven,
  tNumberLiteral,
  tReturn,
  tTypeGiven,
  tTypeIdentifier,
  tValueIdentifier,
} from "../tokenizer/token-type"
// import type { ReadSymbolTable } from "./symbol-table"

export interface NumberLiteral {
  type: "number-literal"
  token: Token<typeof tNumberLiteral>
  // symbolTable: ReadSymbolTable
}

export interface TypeIdentifier {
  type: "type-identifier"
  token: Token<typeof tTypeIdentifier>
  // symbolTable: ReadSymbolTable
}

export interface ValueIdentifier {
  type: "value-identifier"
  token: Token<typeof tValueIdentifier>
  // symbolTable: ReadSymbolTable
}

export interface AwaitAtom {
  type: "await-atom"
  token: Token<typeof tAwait>
  // symbolTable: ReadSymbolTable
}

export interface GivenAtom {
  type: "given-atom"
  token: Token<typeof tGiven>
  // symbolTable: ReadSymbolTable
}

export interface ReturnAtom {
  type: "return-atom"
  token: Token<typeof tReturn>
  // symbolTable: ReadSymbolTable
}

export interface TypeGivenAtom {
  type: "type-given-atom"
  token: Token<typeof tTypeGiven>
  // symbolTable: ReadSymbolTable
}
