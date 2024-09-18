import { checkExampleProgramTree, testParser } from ".."
import { returnStyle } from "../../../tree/block"

testParser("should parse example program types/return.thy", async () => {
  await checkExampleProgramTree("types/return.thy", {
    type: "block",
    ideas: [
      {
        type: "assignment",
        modifier: null,
        variable: {
          type: "value-identifier",
          token: {
            type: "ValueIdentifier",
            text: "myFunction",
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
          typeArgs: [],
          args: [
            {
              type: "block",
              ideas: [
                {
                  type: "assignment",
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
                    type: "given-call",
                    func: {
                      type: "given-atom",
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
                    type: "given-call",
                    func: {
                      type: "given-atom",
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
                    type: "return-atom",
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
