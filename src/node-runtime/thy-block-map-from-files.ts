import { readFile } from "node:fs/promises"
import { interpretThyBlockSourceWithMeta } from "../interpreter/block"
import { saferPromiseAll } from "../utils/safer-promise-all"
import { returnStyle } from "tree"

export async function makeThyBlockMapFromFiles(
  files: readonly string[],
): Promise<Record<string, string>> {
  const exportsList = await saferPromiseAll(
    files.map(async (f) => {
      const contents = await readFile(f, "utf-8")
      const { block } = interpretThyBlockSourceWithMeta(contents)
      return block.returnStyle !== returnStyle.explicitReturn
        ? block.exportedSymbols.reduce(
            (soFar, field) => ({
              ...soFar,
              [field]: f,
            }),
            {},
          )
        : {}
    }),
  )
  return exportsList.reduce(
    (soFar, fileResult) => {
      return {
        ...soFar,
        ...fileResult,
      }
    },
    {} as Record<string, string>,
  )
}
