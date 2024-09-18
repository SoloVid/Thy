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
              type: "value-identifier",
              token: { text: "x" },
            },
            operator: { text: "is" },
            call: {
              type: "value-call",
            },
          },
          {
            type: "assignment",
            modifier: null,
            variable: {
              type: "value-identifier",
              token: { text: "x" },
            },
            operator: { text: "is" },
            call: {
              type: "value-call",
            },
          },
          {
            type: "blank-line",
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
