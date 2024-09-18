import { checkExampleProgramTree, testParser } from ".."
import { returnStyle } from "../../../tree/block"

testParser(
  "should parse example program blocks/call-continuance.thy",
  async () => {
    await checkExampleProgramTree("blocks/call-continuance.thy", {
      type: "block",
      ideas: [
        {
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
                text: "someCondition",
              },
            },
            {
              type: "block",
              ideas: [
                {
                  type: "value-call",
                  func: {
                    type: "value-identifier",
                    token: {
                      type: "ValueIdentifier",
                      text: "doIfTrue",
                    },
                  },
                  typeArgs: [],
                  args: [],
                },
              ],
              returnStyle: returnStyle.implicitExport,
            },
            {
              type: "value-identifier",
              token: {
                type: "ValueIdentifier",
                text: "else",
              },
            },
            {
              type: "block",
              ideas: [
                {
                  type: "value-call",
                  func: {
                    type: "value-identifier",
                    token: {
                      type: "ValueIdentifier",
                      text: "doIfFalse",
                    },
                  },
                  args: [],
                },
              ],
              returnStyle: returnStyle.implicitExport,
            },
          ],
        },
        {
          type: "blank-line",
        },
      ],
      returnStyle: returnStyle.implicitExport,
    })
  },
)
