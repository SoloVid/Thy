import { readExampleFile } from "src/example"
import { checkExampleProgramTree, testParser } from "."
import { returnStyle } from "../../tree/block"

testParser("should parse Hello World", async () => {
  await checkExampleProgramTree("hello-world.thy", {
    type: "block",
    ideas: [
      {
        type: "non-code",
        token: {
          type: "Comment",
          text: 'The next line prints "himom"',
        },
      },
      {
        type: "call",
        func: {
          type: "atom",
          token: {
            type: "ValueIdentifier",
            text: "print",
          },
        },
        args: [
          {
            type: "atom",
            token: {
              type: "StringLiteral",
              text: `"himom"`,
            },
          },
        ],
      },
    ],
    returnStyle: returnStyle.implicitExport,
  })
})
