import { checkExampleProgramTree, testParser } from "../index.ts"
import { returnStyle } from "../../../tree/block.ts"

testParser("should parse example program blocks/simple.thy", async () => {
  await checkExampleProgramTree("blocks/simple.thy", {
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
              text: "someCondition",
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
                    text: "doOneThing",
                  },
                },
                args: [],
              },
              {
                type: "value-call",
                func: {
                  type: "value-identifier",
                  token: {
                    text: "doAnother",
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
            text: "keepDoingMoreStuff",
          },
        },
        args: [],
      },
      {
        type: "blank-line",
      },
    ],
    returnStyle: returnStyle.implicitExport,
  })
})
