import { checkExampleProgramTree, testParser } from "../../index.ts"
import { returnStyle } from "../../../../tree/block.ts"

testParser(
  "should parse example program blocks/functions/return-async-explicit.thy",
  async () => {
    await checkExampleProgramTree(
      "blocks/functions/return-async-explicit.thy",
      {
        type: "block",
        ideas: [
          {
            type: "return",
            func: {
              type: "return-term",
              token: {
                type: "Return",
                text: "return",
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
          {
            type: "blank-line",
          },
        ],
        returnStyle: returnStyle.explicitReturn,
        isAsync: true,
        exportedSymbols: [],
      },
    )
  },
)
