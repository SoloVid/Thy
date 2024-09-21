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
            type: "constant-declaration",
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
            type: "constant-declaration",
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
          message: '"x" is declared elsewhere and cannot be re-declared',
          start: {
            text: "x",
          },
        },
      ],
    )
  },
)
