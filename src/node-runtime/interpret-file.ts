import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { interpretThyBlockSource } from "../interpreter/block"

export type InterpretFileOptions = {
  args: Record<string, unknown>
}

export async function interpretFile(
  file: string,
  { args }: InterpretFileOptions,
) {
  const contents = await readFile(file, "utf-8")
  const interpreted = interpretThyBlockSource(contents, {
    closure: args,
    stackTracePath: resolve(file),
  })
  await interpreted()
}
