import { checkExampleProgramTree, testParser } from "../../index.ts"
import { returnStyle } from "../../../../tree/block.ts"

testParser(
  "should parse example program blocks/functions/return-explicit.thy",
  async () => {
    await checkExampleProgramTree("blocks/functions/return-explicit.thy", {
      type: "block",
      ideas: [
        {
          type: "comment",
          token: {
            type: "Comment",
          },
        },
        {
          type: "comment",
          token: {
            type: "Comment",
          },
        },
        {
          type: "comment",
          token: {
            type: "Comment",
          },
        },
        {
          type: "return",
          func: {
            type: "return-term",
            token: {
              type: "Return",
              text: "return",
            },
          },
          typeArgs: [],
          args: [
            {
              type: "number-literal",
              token: {
                type: "NumberLiteral",
                text: "4",
              },
            },
          ],
        },
        {
          type: "blank-line",
        },
      ],
      returnStyle: returnStyle.explicitReturn,
      exportedSymbols: [],
    })
  },
)
