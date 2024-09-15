import { checkExampleProgramTree, testParser } from ".."
import { returnStyle } from "../../../tree/block"

testParser("should parse example program types/arguments.thy", async () => {
  await checkExampleProgramTree("types/arguments.thy", {
    type: "block",
    ideas: [
      {
        type: "call",
        func: {
          type: "atom",
          token: {
            type: "ValueIdentifier",
            text: "callSomeFunction",
          },
        },
        typeArgs: [
          {
            type: "atom",
            token: {
              type: "TypeIdentifier",
              text: "TypeArg1",
            },
          },
          {
            type: "atom",
            token: {
              type: "TypeIdentifier",
              text: "TypeArg2",
            },
          },
        ],
        args: [
          {
            type: "atom",
            token: {
              type: "ValueIdentifier",
              text: "valueArg1",
            },
          },
          {
            type: "atom",
            token: {
              type: "ValueIdentifier",
              text: "valueArg2",
            },
          },
        ],
      },
    ],
    returnStyle: returnStyle.implicitExport,
  })
})
