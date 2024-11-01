import { checkExampleProgramTree, testParser } from "../.."
import { returnStyle } from "../../../../tree/block"

testParser(
  "should parse example program blocks/functions/return-early.thy",
  async () => {
    await checkExampleProgramTree("blocks/functions/return-early.thy", {
      type: "block",
      ideas: [
        {
          type: "let-call",
          letToken: {
            type: "Let",
            text: "let",
          },
          call: {
            type: "value-call",
            func: {
              type: "value-identifier",
              token: {
                type: "ValueIdentifier",
                text: "if",
              },
            },
            args: [
              {
                type: "value-identifier",
                token: {
                  type: "ValueIdentifier",
                  text: "someEarlyReturnCondition",
                },
              },
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
                        type: "value-identifier",
                        token: {
                          type: "ValueIdentifier",
                          text: "someEarlyValue",
                        },
                      },
                    ],
                  },
                ],
                returnStyle: returnStyle.explicitReturn,
              },
            ],
          },
        },
        {
          type: "comment",
          token: {
            type: "Comment",
            text: "Do the heavy lifting logic down here.",
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
          args: [
            {
              type: "value-identifier",
              token: {
                type: "ValueIdentifier",
                text: "fullValue",
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
