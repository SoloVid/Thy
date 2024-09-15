import { readExampleFile } from "src/example"
import { checkExampleProgramTree, testParser } from ".."
import { returnStyle } from "../../../tree/block"

testParser("should parse example program numbers/literals.thy", async () => {
  await checkExampleProgramTree("numbers/literals.thy", {
    type: "block",
    ideas: [
      {
        type: "call",
        func: {
          type: "atom",
          token: {
            type: "ValueIdentifier",
            text: "crunchSomeNumbers",
          },
        },
        typeArgs: [],
        args: [
          {
            type: "atom",
            token: {
              type: "NumberLiteral",
              text: "1",
            },
          },
          {
            type: "atom",
            token: {
              type: "NumberLiteral",
              text: "-3.14",
            },
          },
          {
            type: "atom",
            token: {
              type: "NumberLiteral",
              text: "9999999999.000000000001",
            },
          },
        ],
      },
    ],
    returnStyle: returnStyle.implicitExport,
  })
})
