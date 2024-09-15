import { checkExampleProgramTree, testParser } from ".."
import { returnStyle } from "../../../tree/block"

testParser("should parse example program types/parameters.thy", async () => {
  await checkExampleProgramTree("types/parameters.thy", {
    type: "block",
    ideas: [
      {
        type: "assignment",
        modifier: null,
        variable: {
          type: "atom",
          token: {
            type: "ValueIdentifier",
            text: "callSomeFunction",
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
                    type: "atom",
                    token: {
                      type: "TypeIdentifier",
                      text: "TypeParam1",
                    },
                  },
                  operator: {
                    type: "ConstantAssignment",
                    text: "is",
                  },
                  call: {
                    type: "type-call",
                    func: {
                      type: "atom",
                      token: {
                        type: "TypeIdentifier",
                        text: "Given",
                      },
                    },
                    args: [
                      {
                        type: "atom",
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
                    type: "atom",
                    token: {
                      type: "TypeIdentifier",
                      text: "TypeParam2",
                    },
                  },
                  operator: {
                    type: "ConstantAssignment",
                    text: "is",
                  },
                  call: {
                    type: "type-call",
                    func: {
                      type: "atom",
                      token: {
                        type: "TypeIdentifier",
                        text: "Given",
                      },
                    },
                    args: [
                      {
                        type: "atom",
                        token: {
                          type: "TypeIdentifier",
                          text: "String",
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
                      text: "valueParam1",
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
                        text: "given",
                      },
                    },
                    typeArgs: [],
                    args: [],
                  },
                },
                {
                  type: "assignment",
                  modifier: null,
                  variable: {
                    type: "atom",
                    token: {
                      type: "ValueIdentifier",
                      text: "valueParam2",
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
    ],
    returnStyle: returnStyle.implicitExport,
  })
})
