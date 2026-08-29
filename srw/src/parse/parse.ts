import { Block } from "@/tree/block.ts"

export function parse(source: string): Block {
  return {
    type: "block",
    ideas: [
      {
        type: "return",
        func: { type: "return-term" },
        args: [{ type: "number-literal" }],
      },
    ],
  }
}
