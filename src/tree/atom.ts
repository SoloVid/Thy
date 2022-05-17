import type { Token } from "../tokenizer/token";
import type { TokenType } from "../tokenizer/token-type";
import type { ReadSymbolTable } from "./symbol-table";

export interface Atom<T extends TokenType = TokenType> {
    type: "atom"
    token: Token<T>
    symbolTable: ReadSymbolTable
}