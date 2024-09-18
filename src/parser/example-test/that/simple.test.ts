import { checkExampleProgramTree, testParser } from ".."
import { returnStyle } from "../../../tree/block"

testParser("should parse example program that/simple.thy", async () => {
  await checkExampleProgramTree("that/simple.thy", {
    type: "block",
    ideas: [
      {
        type: "value-call",
        func: {
          type: "value-identifier",
          token: {
            type: "ValueIdentifier",
            text: "if",
          },
        },
        typeArgs: [],
        args: [
          {
            type: "value-call",
            func: {
              type: "value-property-access",
              base: {
                type: "value-identifier",
                token: {
                  type: "ValueIdentifier",
                  text: "check",
                },
              },
              propertyAccesses: [
                {
                  memberAccessOperatorToken: {
                    type: "MemberAccessOperator",
                    text: ".",
                  },
                  propertyToken: {
                    type: "ValueIdentifier",
                    text: "all",
                  },
                },
              ],
            },
            typeArgs: [],
            args: [
              {
                type: "value-call",
                func: {
                  type: "value-property-access",
                  base: {
                    type: "value-identifier",
                    token: {
                      type: "ValueIdentifier",
                      text: "check",
                    },
                  },
                  propertyAccesses: [
                    {
                      memberAccessOperatorToken: {
                        type: "MemberAccessOperator",
                        text: ".",
                      },
                      propertyToken: {
                        type: "ValueIdentifier",
                        text: "equal",
                      },
                    },
                  ],
                },
                typeArgs: [],
                args: [
                  {
                    type: "value-identifier",
                    token: {
                      type: "ValueIdentifier",
                      text: "foo",
                    },
                  },
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
              {
                type: "value-call",
                func: {
                  type: "value-property-access",
                  base: {
                    type: "value-identifier",
                    token: {
                      type: "ValueIdentifier",
                      text: "check",
                    },
                  },
                  propertyAccesses: [
                    {
                      memberAccessOperatorToken: {
                        type: "MemberAccessOperator",
                        text: ".",
                      },
                      propertyToken: {
                        type: "ValueIdentifier",
                        text: "equal",
                      },
                    },
                  ],
                },
                typeArgs: [],
                args: [
                  {
                    type: "value-identifier",
                    token: {
                      type: "ValueIdentifier",
                      text: "bar",
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
            ],
          },
          {
            type: "block",
            ideas: [
              {
                type: "value-call",
                func: {
                  type: "value-identifier",
                  token: {
                    type: "ValueIdentifier",
                    text: "doSomething",
                  },
                },
                typeArgs: [],
                args: [],
              },
            ],
            returnStyle: "implicitExport",
            isAsync: false,
          },
        ],
      },
      {
        type: "blank-line",
      },
    ],
    returnStyle: "implicitExport",
    isAsync: false,
  })
})
