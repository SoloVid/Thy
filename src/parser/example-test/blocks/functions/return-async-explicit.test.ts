import { checkExampleProgramTree, testParser } from "../.."
import { returnStyle } from "../../../../tree/block"

testParser(
  "should parse example program blocks/functions/return-async-explicit.thy",
  async () => {
    await checkExampleProgramTree(
      "blocks/functions/return-async-explicit.thy",
      {
        type: "block",
        ideas: [
          {
            type: "call",
            func: {
              type: "atom",
              token: {
                type: "ValueIdentifier",
                text: "return",
              },
            },
            args: [
              {
                type: "call",
                func: {
                  type: "atom",
                  token: {
                    type: "ValueIdentifier",
                    text: "await",
                  },
                },
                args: [
                  {
                    type: "call",
                    func: {
                      type: "atom",
                      token: {
                        type: "ValueIdentifier",
                        text: "doSomethingLong",
                      },
                    },
                    args: [],
                  },
                ],
              },
            ],
          },
        ],
        returnStyle: returnStyle.asyncReturn,
      },
    )
  },
)
