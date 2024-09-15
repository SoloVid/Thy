import { checkExampleProgramTree, testParser } from "../.."
import { returnStyle } from "../../../../tree/block"

testParser(
  "should parse example program blocks/objects/literal.thy",
  async () => {
    await checkExampleProgramTree("blocks/objects/literal.thy", {
      type: "block",
      ideas: [
        {
          type: "assignment",
          modifier: null,
          variable: {
            type: "atom",
            token: {
              type: "ValueIdentifier",
              text: "myThing",
            },
          },
          operator: {
            type: "ConstantAssignment",
            text: "is",
          },
          call: {
            type: "call",
            func: {
              type: "block",
              ideas: [
                {
                  type: "assignment",
                  modifier: null,
                  variable: {
                    type: "atom",
                    token: {
                      type: "ValueIdentifier",
                      text: "propA",
                    },
                  },
                  operator: {
                    type: "ConstantAssignment",
                    text: "is",
                  },
                  call: {
                    type: "call",
                    func: {
                      type: "atom",
                      token: {
                        type: "ValueIdentifier",
                        text: "def",
                      },
                    },
                    args: [
                      {
                        type: "atom",
                        token: {
                          type: "StringLiteral",
                          text: '"A"',
                        },
                      },
                    ],
                  },
                },
                {
                  type: "assignment",
                  modifier: null,
                  variable: {
                    type: "atom",
                    token: {
                      type: "ValueIdentifier",
                      text: "propB",
                    },
                  },
                  operator: {
                    type: "ConstantAssignment",
                    text: "is",
                  },
                  call: {
                    type: "call",
                    func: {
                      type: "atom",
                      token: {
                        type: "ValueIdentifier",
                        text: "calculateSomething",
                      },
                    },
                    args: [],
                  },
                },
              ],
              returnStyle: returnStyle.implicitExport,
            },
            args: [],
          },
        },
      ],
      returnStyle: returnStyle.implicitExport,
    })
  },
)
