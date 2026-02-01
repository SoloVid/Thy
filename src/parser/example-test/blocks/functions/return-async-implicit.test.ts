import { checkExampleProgramTree, testParser } from "../../index.ts"
import { returnStyle } from "../../../../tree/block.ts"

testParser(
  "should parse example program blocks/functions/return-async-implicit.thy",
  async () => {
    await checkExampleProgramTree(
      "blocks/functions/return-async-implicit.thy",
      {
        type: "block",
        ideas: [
          {
            type: "constant-declaration",
            modifier: null,
            variable: {
              token: {
                text: "a",
                type: "ValueIdentifier",
              },
              type: "value-identifier",
            },
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
                    type: "await-term",
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
        exportedSymbols: ["a"],
      },
    )
  },
)
