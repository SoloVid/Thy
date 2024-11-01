import { checkExampleProgramTree, testParser } from ".."
import { returnStyle } from "../../../tree/block"

testParser("should parse example program types/parameters.thy", async () => {
  await checkExampleProgramTree("types/parameters.thy", {
    type: "block",
    ideas: [
      {
        type: "constant-declaration",
        modifier: null,
        variable: {
          type: "value-identifier",
          token: {
            type: "ValueIdentifier",
            text: "callSomeFunction",
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
                  type: "type-assignment",
                  modifier: null,
                  typeToken: {
                    type: "Type",
                    text: "type",
                  },
                  variable: {
                    type: "type-identifier",
                    token: {
                      type: "TypeIdentifier",
                      text: "TypeParam1",
                    },
                  },
                  operator: {
                    type: "ConstDeclAssign",
                    text: "is",
                  },
                  call: {
                    type: "type-given-call",
                    func: {
                      type: "type-given-term",
                      token: {
                        type: "TypeGiven",
                        text: "Given",
                      },
                    },
                    args: [
                      {
                        type: "type-identifier",
                        token: {
                          type: "TypeIdentifier",
                          text: "Unknown",
                        },
                      },
                    ],
                  },
                },
                {
                  type: "type-assignment",
                  modifier: null,
                  typeToken: {
                    type: "Type",
                    text: "type",
                  },
                  variable: {
                    type: "type-identifier",
                    token: {
                      type: "TypeIdentifier",
                      text: "TypeParam2",
                    },
                  },
                  operator: {
                    type: "ConstDeclAssign",
                    text: "is",
                  },
                  call: {
                    type: "type-given-call",
                    func: {
                      type: "type-given-term",
                      token: {
                        type: "TypeGiven",
                        text: "Given",
                      },
                    },
                    args: [
                      {
                        type: "type-identifier",
                        token: {
                          type: "TypeIdentifier",
                          text: "String",
                        },
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
                      text: "valueParam1",
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
                    typeArgs: [],
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
                      text: "valueParam2",
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
                    typeArgs: [],
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
