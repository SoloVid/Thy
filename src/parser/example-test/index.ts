import { expect } from "expect"
import type { DeepPartial } from "src/utils/utility-types"
import { defineTestGroup } from "test-framework"
import type { CompileError } from "../../compile-error"
import { readExampleFile } from "../../example"
import { makeTokenizer } from "../../tokenizer/tokenizer"
import { parse } from "../parser"

export const testParser = defineTestGroup("parser ")

const maxTestN = 1000

export async function checkExampleProgramTree(
  exampleProgramName: string,
  expectedOutput: unknown,
  expectedErrors: DeepPartial<CompileError>[] = [],
) {
  const { errors, top } = await parseExampleProgram(exampleProgramName)
  // console.log(errors)
  expect(errors).toMatchObject(expectedErrors)
  // console.log(top)
  // console.log(JSON.stringify(top, (key, value) => {
  //   if (["symbolTable", "firstToken", "lastToken", "offset", "line", "column"].includes(key)) {
  //     return undefined
  //   }
  //   return value
  // }, 2))
  expect(top).toMatchObject(expectedOutput as any)
}

export async function parseExampleProgram(exampleProgramName: string) {
  const source = await readExampleFile(exampleProgramName)
  return parseSource(source)
}

export function checkProgramTree(
  source: string,
  expectedOutput: unknown,
  expectedErrors: DeepPartial<CompileError>[] = [],
) {
  const { errors, top } = parseSource(source)
  // console.log(errors)
  expect(errors).toMatchObject(expectedErrors)
  expect(top).toMatchObject(expectedOutput as any)
}

export function parseSource(source: string) {
  const errors: CompileError[] = []
  const tokenizer = makeTokenizer(source, errors)
  const output = parse(tokenizer)
  return output
}
