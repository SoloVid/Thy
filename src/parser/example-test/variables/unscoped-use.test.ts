import { checkExampleProgramTree, testParser } from ".."

testParser(
  "should parse example program variables/unscoped-use.thy",
  async () => {
    await checkExampleProgramTree("variables/unscoped-use.thy", {
      type: "block",
      ideas: [
        {
          type: "value-call",
          func: {
            type: "value-identifier",
            token: {
              text: "foo",
            },
          },
          args: [
            { type: "value-identifier", token: { text: "a" } },
            { type: "value-identifier", token: { text: "b" } },
          ],
        },
        {
          type: "blank-line",
        },
      ],
    })
  },
)
