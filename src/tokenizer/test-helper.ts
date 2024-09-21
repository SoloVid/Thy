import { expect } from "expect"
import { defineTestGroup } from "test-framework"
import { makeTokenizer } from "."
import type { CompileError } from "../common/compile-error"
import { readExampleFile } from "../example"
import type { Token } from "./token"
import { tEndStream, type TokenType } from "./token-type"

export const testTokenizer = defineTestGroup("tokenizer ")

const maxTestN = 1000

export async function checkExampleProgramTokens(
  exampleProgramName: string,
  tokens: readonly (
    | TokenType
    | readonly [
        TokenType,
        string | { asymmetricMatch(other: unknown): boolean },
      ]
  )[],
) {
  const { errors, outputs } = await tokenizeExampleProgram(exampleProgramName)
  expect(errors).toEqual([])
  expect(outputs.map((t) => [t.type, t.text])).toEqual(
    tokens.map((t) => (Array.isArray(t) ? t : [t, expect.anything()])),
  )
}

export async function tokenizeExampleProgram(exampleProgramName: string) {
  const source = await readExampleFile(exampleProgramName)
  return tokenizeSource(source)
}

export function checkSourceTokens(
  source: string,
  tokens: readonly (
    | TokenType
    | readonly [
        TokenType,
        string | { asymmetricMatch(other: unknown): boolean },
      ]
  )[],
) {
  const { errors, outputs } = tokenizeSource(source)
  expect(errors).toEqual([])
  expect(outputs.map((t) => [t.type, t.text])).toEqual(
    tokens.map((t) => (Array.isArray(t) ? t : [t, expect.anything()])),
  )
}

export function tokenizeSource(source: string) {
  const errors: CompileError[] = []
  const tokenizer = makeTokenizer(source, errors)
  const outputs: Token[] = []
  for (let i = 0; i < maxTestN; i++) {
    const nextToken = tokenizer.getNextToken()
    if (nextToken.type === tEndStream) {
      break
    }
    outputs.push(nextToken)
  }
  expect(tokenizer.getNextToken()).toMatchObject({ type: tEndStream })
  return {
    errors,
    outputs,
  }
}
