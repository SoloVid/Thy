import { checkExampleProgramTree, testParser } from "../.."
import { returnStyle } from "../../../../tree/block"

testParser(
  "should parse example program blocks/functions/implicit-parameters.thy",
  async () => {
    await checkExampleProgramTree("blocks/functions/implicit-parameters.thy", {
      type: "block",
      ideas: [
        {
          type: "call",
          func: {
            type: "atom",
            token: {
              type: "ValueIdentifier",
              text: "switch",
            },
          },
          args: [
            {
              type: "atom",
              token: {
                type: "ValueIdentifier",
                text: "myInput",
              },
            },
            {
              type: "block",
              ideas: [
                {
                  type: "call",
                  func: {
                    type: "atom",
                    token: {
                      type: "ValueIdentifier",
                      text: "case",
                    },
                  },
                  args: [
                    {
                      type: "atom",
                      token: {
                        type: "StringLiteral",
                        text: '"foo"',
                      },
                    },
                    {
                      type: "block",
                      ideas: [
                        {
                          type: "call",
                          func: {
                            type: "atom",
                            token: {
                              type: "ValueIdentifier",
                              text: "doSomething",
                            },
                          },
                          args: [],
                        },
                      ],
                      returnStyle: returnStyle.implicitExport,
                    },
                  ],
                },
                {
                  type: "call",
                  func: {
                    type: "atom",
                    token: {
                      type: "ValueIdentifier",
                      text: "case",
                    },
                  },
                  args: [
                    {
                      type: "atom",
                      token: {
                        type: "StringLiteral",
                        text: '"bar"',
                      },
                    },
                    {
                      type: "block",
                      ideas: [
                        {
                          type: "call",
                          func: {
                            type: "atom",
                            token: {
                              type: "ValueIdentifier",
                              text: "doSomethingElse",
                            },
                          },
                          args: [],
                        },
                      ],
                      returnStyle: returnStyle.implicitExport,
                    },
                  ],
                },
                {
                  type: "call",
                  func: {
                    type: "atom",
                    token: {
                      type: "ValueIdentifier",
                      text: "default",
                    },
                  },
                  args: [
                    {
                      type: "block",
                      ideas: [
                        {
                          type: "call",
                          func: {
                            type: "atom",
                            token: {
                              type: "ValueIdentifier",
                              text: "freakOut",
                            },
                          },
                          args: [],
                        },
                      ],
                      returnStyle: returnStyle.implicitExport,
                    },
                  ],
                },
              ],
              returnStyle: returnStyle.implicitExport,
            },
          ],
        },
      ],
      returnStyle: returnStyle.implicitExport,
    })
  },
)
