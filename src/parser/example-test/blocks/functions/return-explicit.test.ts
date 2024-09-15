import { checkExampleProgramTree, testParser } from "../.."
import { returnStyle } from "../../../../tree/block"

testParser(
  "should parse example program blocks/functions/return-explicit.thy",
  async () => {
    await checkExampleProgramTree("blocks/functions/return-explicit.thy", {
      type: "block",
      ideas: [
        {
          type: "non-code",
          token: {
            type: "Comment",
          },
        },
        {
          type: "non-code",
          token: {
            type: "Comment",
          },
        },
        {
          type: "non-code",
          token: {
            type: "Comment",
          },
        },
        {
          type: "call",
          func: {
            type: "atom",
            token: {
              type: "ValueIdentifier",
              text: "return",
            },
          },
          typeArgs: [],
          args: [
            {
              type: "atom",
              token: {
                type: "NumberLiteral",
                text: "4",
              },
            },
          ],
        },
      ],
      returnStyle: returnStyle.explicitReturn,
    })
  },
)
