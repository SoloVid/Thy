import { readFile } from "node:fs/promises"
import { interpretThyBlock } from "../interpreter/block"
import { makeThyFromBlocks } from "../std-lib/thy-from-blocks"
import { saferPromiseAll } from "../utils/safer-promise-all"
import { makeThyBlockMapFromFiles } from "./thy-block-map-from-files"

type MakeThyFromFilesOptions = {
  files: readonly string[]
  args: Record<string, unknown>
}

type UnknownFunction = (...args: readonly unknown[]) => unknown

export async function makeThyFromFiles({
  files,
  args,
}: MakeThyFromFilesOptions) {
  const blockMapToFiles = await makeThyBlockMapFromFiles(files)
  const blockPairs = await saferPromiseAll(files.map(async (f) => {
    const contents = await readFile(f, "utf-8")
    return {
      file: f,
      block: interpretThyBlock(contents, {
        closure: args,
        sourceFile: f,
      }),
    }
  }))
  const fileToBlock = blockPairs.reduce((soFar, {file, block}) => ({
    ...soFar,
    [file]: block,
  }), {} as Record<string, UnknownFunction>)
  const blockMap = Object.entries(blockMapToFiles).reduce((soFar, [field, file]) => ({
    ...soFar,
    [field]: fileToBlock[file],
  }), {} as Record<string, UnknownFunction>)
  const blocks = blockPairs.map(({ block }) => block)
  return makeThyFromBlocks({
    blocks,
    blockMap,
  })
}
