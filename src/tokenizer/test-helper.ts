import { expect } from "expect"
import { defineTestGroup } from "under-the-sun"
import { makeTokenizer } from "."
import type { CompileError } from "../compile-error"
import { readExampleFile } from "../example"
import type { Token } from "./token"
import type { TokenType } from "./token-type"

export const testTokenizer = defineTestGroup("tokenizer ")

const maxTestN = 1000

export async function checkExampleProgramTokenTypes(exampleProgram: string, tokenTypes: readonly TokenType[]) {
  const { errors, outputs } = await tokenizeExampleProgram(exampleProgram)
  expect(errors).toEqual([])
  expect(outputs.map(t => t.type)).toEqual(tokenTypes)
}

export async function checkExampleProgramTokens(exampleProgram: string, tokens: readonly (readonly [TokenType, string])[]) {
  const { errors, outputs } = await tokenizeExampleProgram(exampleProgram)
  expect(errors).toEqual([])
  expect(outputs.map(t => [t.type, t.text])).toEqual(tokens)
}

export async function tokenizeExampleProgram(exampleProgram: string) {
  const source = await readExampleFile(exampleProgram)
  const errors: CompileError[] = []
  const tokenizer = makeTokenizer(source, errors)
  const outputs: Token[] = []
  for (let i = 0; i < maxTestN; i++) {
    const nextToken = tokenizer.getNextToken()
    if (nextToken === null) {
      break
    }
    outputs.push(nextToken)
  }
  expect(tokenizer.getNextToken()).toBeNull()
  return {
    errors,
    outputs,
  }
}
