import { checkExampleProgramTree, testParser } from ".."
import { returnStyle } from "../../../tree/block"

testParser("should parse example program types/arguments.thy", async () => {
  await checkExampleProgramTree("types/arguments.thy", {
    type: "block",
    ideas: [
      {
        type: "value-call",
        func: {
          type: "value-identifier",
          token: {
            type: "ValueIdentifier",
            text: "callSomeFunction",
          },
        },
        typeArgs: [
          {
            type: "type-identifier",
            token: {
              type: "TypeIdentifier",
              text: "TypeArg1",
            },
          },
          {
            type: "type-identifier",
            token: {
              type: "TypeIdentifier",
              text: "TypeArg2",
            },
          },
        ],
        args: [
          {
            type: "value-identifier",
            token: {
              type: "ValueIdentifier",
              text: "valueArg1",
            },
          },
          {
            type: "value-identifier",
            token: {
              type: "ValueIdentifier",
              text: "valueArg2",
            },
          },
        ],
      },
      { type: "blank-line" },
    ],
    returnStyle: returnStyle.implicitExport,
  })
})
