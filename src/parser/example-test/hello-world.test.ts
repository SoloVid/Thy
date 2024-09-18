import { checkExampleProgramTree, testParser } from "."
import { returnStyle } from "../../tree/block"

testParser("should parse Hello World", async () => {
  await checkExampleProgramTree("hello-world.thy", {
    type: "block",
    ideas: [
      {
        type: "comment",
        token: {
          type: "Comment",
          text: 'The next line prints "himom"',
        },
      },
      {
        type: "value-call",
        func: {
          type: "value-identifier",
          token: {
            type: "ValueIdentifier",
            text: "print",
          },
        },
        args: [
          {
            type: "string-literal",
            parts: [
              {
                type: "string-content",
                token: {
                  type: "StringText",
                  text: `himom`,
                },
              },
            ],
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
