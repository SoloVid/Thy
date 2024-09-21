import { checkExampleProgramTree, testParser } from "../.."
import { returnStyle } from "../../../../tree/block"

testParser(
  "should parse example program blocks/functions/return-async-early.thy",
  async () => {
    await checkExampleProgramTree("blocks/functions/return-async-early.thy", {
      type: "block",
      ideas: [
        {
          type: "let-call",
          letToken: {
            type: "Let",
          },
          call: {
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
        },
        {
          type: "blank-line",
        },
      ],
      returnStyle: returnStyle.explicitReturn,
      isAsync: true,
      exportedSymbols: [],
    })
  },
)
