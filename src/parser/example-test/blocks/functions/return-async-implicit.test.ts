import { checkExampleProgramTree, testParser } from "../.."
import { returnStyle } from "../../../../tree/block"

testParser(
  "should parse example program blocks/functions/return-async-implicit.thy",
  async () => {
    await checkExampleProgramTree(
      "blocks/functions/return-async-implicit.thy",
      {
        type: "block",
        ideas: [
          {
            type: "assignment",
            modifier: null,
            call: {
              type: "value-call",
              func: {
                type: "value-identifier",
                token: {
                  type: "ValueIdentifier",
                  text: "def",
                },
              },
              args: [
                {
                  type: "await-call",
                  func: {
                    type: "await-atom",
                    token: {
                      type: "Await",
                      text: "await",
                    },
                  },
                  args: [
                    {
                      type: "value-call",
                      func: {
                        type: "value-identifier",
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
          },
          {
            type: "blank-line",
          },
        ],
        returnStyle: returnStyle.implicitExport,
        isAsync: true,
      },
    )
  },
)
