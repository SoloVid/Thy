import { checkExampleProgramTree, testParser } from ".."
import { returnStyle } from "../../../tree/block"

testParser("should parse example program types/return.thy", async () => {
  await checkExampleProgramTree("types/return.thy", {
    type: "block",
    ideas: [
      {
        type: "constant-declaration",
        modifier: null,
        variable: {
          type: "value-identifier",
          token: {
            type: "ValueIdentifier",
            text: "myFunction",
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
          typeArgs: [],
          args: [
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
                    type: "ConstDeclAssign",
                    text: "is",
                  },
                  call: {
                    type: "given-call",
                    func: {
                      type: "given-term",
                      token: {
                        type: "Given",
                        text: "given",
                      },
                    },
                    typeArgs: [
                      {
                        type: "type-identifier",
                        token: {
                          type: "TypeIdentifier",
                          text: "Number",
                        },
                      },
                    ],
                    args: [],
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
                    type: "given-call",
                    func: {
                      type: "given-term",
                      token: {
                        type: "Given",
                        text: "given",
                      },
                    },
                    typeArgs: [
                      {
                        type: "type-identifier",
                        token: {
                          type: "TypeIdentifier",
                          text: "Number",
                        },
                      },
                    ],
                    args: [],
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
                  typeArgs: [
                    {
                      type: "type-identifier",
                      token: {
                        type: "TypeIdentifier",
                        text: "Number",
                      },
                    },
                  ],
                  args: [
                    {
                      type: "number-literal",
                    },
                  ],
                },
                {
                  type: "blank-line",
                },
                {
                  type: "comment",
                  token: {
                    type: "Comment",
                    text: "Do some math or something down here.",
                  },
                },
              ],
              returnStyle: returnStyle.explicitReturn,
            },
          ],
        },
      },
      {
        type: "blank-line",
      },
    ],
    returnStyle: returnStyle.implicitExport,
  })
})
