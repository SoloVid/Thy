import { checkExampleProgramTree, testParser } from ".."
import { returnStyle } from "../../../tree/block"

testParser(
  "should parse example program blocks/immediately-invoked.thy",
  async () => {
    await checkExampleProgramTree("blocks/immediately-invoked.thy", {
      type: "block",
      ideas: [
        {
          type: "constant-declaration",
          modifier: null,
          variable: {
            type: "value-identifier",
            token: {
              type: "ValueIdentifier",
              text: "myValue",
            },
          },
          operator: {
            type: "ConstDeclAssign",
            text: "is",
          },
          call: {
            type: "value-call",
            func: {
              type: "block",
              ideas: [
                {
                  type: "return",
                  func: {
                    type: "return-atom",
                    token: {
                      type: "Return",
                      text: "return",
                    },
                  },
                  args: [
                    {
                      type: "number-literal",
                      token: {
                        type: "NumberLiteral",
                        text: "5",
                      },
                    },
                  ],
                },
              ],
              returnStyle: returnStyle.explicitReturn,
            },
            args: [],
          },
        },
        {
          type: "blank-line",
        },
      ],
      returnStyle: returnStyle.implicitExport,
    })
  },
)
