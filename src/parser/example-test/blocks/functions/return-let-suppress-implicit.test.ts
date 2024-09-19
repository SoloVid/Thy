import { checkExampleProgramTree, testParser } from "../.."
import { returnStyle } from "../../../../tree/block"

testParser(
  "should parse example program blocks/functions/return-let-suppress-implicit.thy",
  async () => {
    await checkExampleProgramTree(
      "blocks/functions/return-let-suppress-implicit.thy",
      {
        type: "block",
        ideas: [
          {
            type: "constant-declaration",
            modifier: null,
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
            type: "constant-declaration",
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
            type: "let-call",
            letToken: {
              type: "Let",
              text: "let",
            },
            call: null,
          },
          {
            type: "blank-line",
          },
        ],
        returnStyle: returnStyle.explicitReturn,
      },
    )
  },
)
