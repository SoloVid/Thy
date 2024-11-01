import { checkExampleProgramTree, testParser } from ".."
import { returnStyle } from "../../../tree/block"

testParser("should parse example program types/given.thy", async () => {
  await checkExampleProgramTree("types/given.thy", {
    type: "block",
    ideas: [
      {
        type: "constant-declaration",
        modifier: null,
        variable: {
          type: "value-identifier",
          token: {
            type: "ValueIdentifier",
            text: "doSomeMath",
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
