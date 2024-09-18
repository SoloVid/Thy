import { checkExampleProgramTree, testParser } from "../.."
import { returnStyle } from "../../../../tree/block"

testParser(
  "should parse example program blocks/functions/return-implicit-export-private.thy",
  async () => {
    await checkExampleProgramTree(
      "blocks/functions/return-implicit-export-private.thy",
      {
        type: "block",
        ideas: [
          {
            type: "assignment",
            modifier: {
              type: "Private",
              text: "private",
            },
            variable: {
              type: "value-identifier",
              token: {
                type: "ValueIdentifier",
                text: "a",
              },
            },
            operator: {
              type: "ConstantAssignment",
              text: "is",
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
                  type: "string-literal",
                },
              ],
            },
          },
          {
            type: "assignment",
            modifier: null,
            variable: {
              type: "value-identifier",
              token: {
                type: "ValueIdentifier",
                text: "b",
              },
            },
            operator: {
              type: "ConstantAssignment",
              text: "is",
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
                  type: "number-literal",
                  token: {
                    type: "NumberLiteral",
                    text: "2",
                  },
                },
              ],
            },
          },
          {
            type: "blank-line",
          },
        ],
        returnStyle: returnStyle.implicitExport,
      },
    )
  },
)
