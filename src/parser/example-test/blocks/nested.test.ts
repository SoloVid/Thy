import { checkExampleProgramTree, testParser } from "../index.ts"
import { returnStyle } from "../../../tree/block.ts"

testParser("should parse example program blocks/nested.thy", async () => {
  await checkExampleProgramTree("blocks/nested.thy", {
    type: "block",
    ideas: [
      {
        type: "value-call",
        func: {
          type: "value-identifier",
          token: {
            text: "if",
          },
        },
        args: [
          {
            type: "value-identifier",
            token: {
              text: "condition1",
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
                    text: "if",
                  },
                },
                args: [
                  {
                    type: "value-identifier",
                    token: {
                      text: "condition2a",
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
                            text: "if",
                          },
                        },
                        args: [
                          {
                            type: "value-identifier",
                            token: {
                              text: "condition3",
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
                                    text: "do3",
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
              {
                type: "value-call",
                func: {
                  type: "value-identifier",
                  token: {
                    text: "if",
                  },
                },
                args: [
                  {
                    type: "value-identifier",
                    token: {
                      text: "condition2b",
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
                            text: "do2b",
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
      {
        type: "blank-line",
      },
    ],
    returnStyle: returnStyle.implicitExport,
  })
})
