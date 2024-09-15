import { checkExampleProgramTree, testParser } from ".."
import { returnStyle } from "../../../tree/block"

testParser("should parse example program blocks/simple.thy", async () => {
  await checkExampleProgramTree("blocks/simple.thy", {
    type: "block",
    ideas: [
      {
        type: "call",
        func: {
          type: "atom",
          token: {
            text: "if",
          },
        },
        args: [
          {
            type: "atom",
            token: {
              text: "someCondition",
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
                    text: "doOneThing",
                  },
                },
                args: [],
              },
              {
                type: "call",
                func: {
                  type: "atom",
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
        type: "call",
        func: {
          type: "atom",
          token: {
            text: "keepDoingMoreStuff",
          },
        },
        args: [],
      },
    ],
    returnStyle: returnStyle.implicitExport,
  })
})
