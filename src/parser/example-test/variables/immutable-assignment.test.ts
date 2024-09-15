import { checkExampleProgramTree, testParser } from ".."

testParser(
  "should parse example program variables/immutable-assignment.thy",
  async () => {
    await checkExampleProgramTree(
      "variables/immutable-assignment.thy",
      {
        type: "block",
        ideas: [
          {
            type: "assignment",
            modifier: null,
            variable: {
              type: "atom",
              token: { text: "x" },
            },
            operator: { text: "is" },
            call: {
              type: "call",
            },
          },
          {
            type: "assignment",
            modifier: null,
            variable: {
              type: "atom",
              token: { text: "x" },
            },
            operator: { text: "is" },
            call: {
              type: "call",
            },
          },
        ],
      },
      [
        {
          message:
            "Scoped variable is declared elsewhere and cannot be re-declared",
          start: {
            text: "x",
          },
        },
      ],
    )
  },
)
