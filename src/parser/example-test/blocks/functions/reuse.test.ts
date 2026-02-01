import { checkExampleProgramTree, testParser } from "../../index.ts"
import { returnStyle } from "../../../../tree/block.ts"

testParser(
  "should parse example program blocks/functions/reuse.thy",
  async () => {
    await checkExampleProgramTree("blocks/functions/reuse.thy", {
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
                        text: "someValue",
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
                          text: "doSomeStuff",
                        },
                      },
                      args: [
                        {
                          type: "value-identifier",
                          token: {
                            type: "ValueIdentifier",
                            text: "a",
                          },
                        },
                        {
                          type: "value-identifier",
                          token: {
                            type: "ValueIdentifier",
                            text: "b",
                          },
                        },
                      ],
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
                    args: [
                      {
                        type: "value-identifier",
                        token: {
                          type: "ValueIdentifier",
                          text: "someValue",
                        },
                      },
                    ],
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
        {
          type: "comment",
          token: {
            type: "Comment",
            text: "And later...",
          },
        },
        {
          type: "value-call",
          func: {
            type: "value-identifier",
            token: {
              type: "ValueIdentifier",
              text: "myFunction",
            },
          },
          args: [
            {
              type: "number-literal",
              token: {
                type: "NumberLiteral",
                text: "1",
              },
            },
            {
              type: "number-literal",
              token: {
                type: "NumberLiteral",
                text: "2",
              },
            },
          ],
        },
        { type: "blank-line" },
      ],
      returnStyle: returnStyle.implicitExport,
    })
  },
)
