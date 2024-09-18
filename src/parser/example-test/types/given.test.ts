import { checkExampleProgramTree, testParser } from ".."
import { returnStyle } from "../../../tree/block"

testParser("should parse example program types/given.thy", async () => {
  await checkExampleProgramTree("types/given.thy", {
    type: "block",
    ideas: [
      {
        type: "assignment",
        modifier: null,
        variable: {
          type: "value-identifier",
          token: {
            type: "ValueIdentifier",
            text: "doSomeMath",
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
              ],
              returnStyle: returnStyle.implicitExport,
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
