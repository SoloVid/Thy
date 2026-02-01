import { checkExampleProgramTree, testParser } from "../../index.ts"
import { returnStyle } from "../../../../tree/block.ts"

testParser(
  "should parse example program blocks/objects/literal.thy",
  async () => {
    await checkExampleProgramTree("blocks/objects/literal.thy", {
      type: "block",
      ideas: [
        {
          type: "constant-declaration",
          modifier: null,
          variable: {
            type: "value-identifier",
            token: {
              type: "ValueIdentifier",
              text: "myThing",
            },
          },
          operator: {
            type: "ConstDeclAssign",
            text: "is",
          },
          call: {
            type: "value-call",
            func: {
              type: "block",
              ideas: [
                {
                  type: "constant-declaration",
                  modifier: null,
                  variable: {
                    type: "value-identifier",
                    token: {
                      type: "ValueIdentifier",
                      text: "propA",
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
                        parts: [
                          {
                            type: "string-content",
                            token: {
                              type: "StringText",
                              text: "A",
                            },
                          },
                        ],
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
                      text: "propB",
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
        {
          type: "blank-line",
        },
      ],
      returnStyle: returnStyle.implicitExport,
    })
  },
)
