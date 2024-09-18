import { checkExampleProgramTree, testParser } from "../.."
import { returnStyle } from "../../../../tree/block"

testParser(
  "should parse example program blocks/functions/implicit-parameters.thy",
  async () => {
    await checkExampleProgramTree("blocks/functions/implicit-parameters.thy", {
      type: "block",
      ideas: [
        {
          type: "value-call",
          func: {
            type: "value-identifier",
            token: {
              type: "ValueIdentifier",
              text: "switch",
            },
          },
          args: [
            {
              type: "value-identifier",
              token: {
                type: "ValueIdentifier",
                text: "myInput",
              },
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
                      text: "case",
                    },
                  },
                  args: [
                    {
                      type: "string-literal",
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
                          args: [],
                        },
                      ],
                      returnStyle: returnStyle.implicitExport,
                    },
                  ],
                },
                {
                  type: "value-call",
                  func: {
                    type: "value-identifier",
                    token: {
                      type: "ValueIdentifier",
                      text: "case",
                    },
                  },
                  args: [
                    {
                      type: "string-literal",
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
                  type: "value-call",
                  func: {
                    type: "value-identifier",
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
                          type: "value-call",
                          func: {
                            type: "value-identifier",
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
        { type: "blank-line" },
      ],
      returnStyle: returnStyle.implicitExport,
    })
  },
)
