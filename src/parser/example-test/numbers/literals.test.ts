import { checkExampleProgramTree, testParser } from "../index.ts"
import { returnStyle } from "../../../tree/block.ts"

testParser("should parse example program numbers/literals.thy", async () => {
  await checkExampleProgramTree("numbers/literals.thy", {
    type: "block",
    ideas: [
      {
        type: "value-call",
        func: {
          type: "value-identifier",
          token: {
            type: "ValueIdentifier",
            text: "crunchSomeNumbers",
          },
        },
        typeArgs: [],
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
              text: "-3.14",
            },
          },
          {
            type: "number-literal",
            token: {
              type: "NumberLiteral",
              text: "9999999999.000000000001",
            },
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
