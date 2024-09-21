import type { CompileError } from "common/compile-error"
import { readExampleFile } from "example"
import { expect } from "expect"
import { defineTestGroup } from "test-framework"
import { makeTokenizer } from "tokenizer"
import type { TreeNode } from "tree"
import type { DeepPartial } from "utils/utility-types"
import { badParse, BadParse, ErrorableTreeNode } from "../error"
import { parse } from "../parser"

export const testParser = defineTestGroup("parser ")

const maxTestN = 1000

export function debugNodeStructure(
  node: TreeNode | ErrorableTreeNode | BadParse,
) {
  if (node == badParse) {
    console.log("<badParse>")
    return
  }
  console.log(JSON.stringify(getNodeStructure(node), null, 2))
}

export function getNodeStructure(
  node: TreeNode | ErrorableTreeNode | BadParse,
) {
  if (node == badParse) {
    return badParse
  }
  return JSON.parse(
    JSON.stringify(
      node,
      (key, value) => {
        if (
          [
            "symbolTable",
            "firstToken",
            "lastToken",
            "offset",
            "line",
            "column",
          ].includes(key)
        ) {
          return undefined
        }
        return value
      },
      2,
    ),
  )
}

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
  return parse(tokenizer, errors)
}
