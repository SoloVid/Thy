import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { interpretThyBlock } from "../interpreter/block";

export type InterpretFileOptions = {
  args: Record<string, unknown>
}

export async function interpretFile(file: string, {
  args,
}: InterpretFileOptions) {
  const contents = await readFile(file, "utf-8")
  const interpreted = interpretThyBlock(contents, {
    closure: args,
    sourceFile: resolve(file),
  })
  await interpreted()
}
