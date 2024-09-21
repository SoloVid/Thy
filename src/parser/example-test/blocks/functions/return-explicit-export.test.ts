import { checkExampleProgramTree, testParser } from "../.."
import { returnStyle } from "../../../../tree/block"

testParser(
  "should parse example program blocks/functions/return-explicit-export.thy",
  async () => {
    await checkExampleProgramTree(
      "blocks/functions/return-explicit-export.thy",
      {
        type: "block",
        ideas: [
          {
            type: "constant-declaration",
            modifier: {
              type: "Export",
              text: "export",
            },
            variable: {
              type: "value-identifier",
              token: {
                type: "ValueIdentifier",
                text: "a",
              },
            },
            operator: {
              type: "ConstDeclAssign",
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
              type: "ConstDeclAssign",
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
        returnStyle: returnStyle.explicitExport,
        exportedSymbols: ["a"],
      },
    )
  },
)
