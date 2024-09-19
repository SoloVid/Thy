import { checkExampleProgramTree, testParser } from ".."

testParser(
  "should parse example program variables/mutable-assignment.thy",
  async () => {
    await checkExampleProgramTree("variables/mutable-assignment.thy", {
      type: "block",
      ideas: [
        {
          type: "variable-declaration",
          modifier: null,
          variable: {
            type: "value-identifier",
            token: { text: "x" },
          },
          operator: { text: "be" },
          call: {
            type: "value-call",
          },
        },
        {
          type: "variable-reassignment",
          modifier: null,
          variable: {
            type: "value-identifier",
            token: { text: "x" },
          },
          operator: { text: "to" },
          call: {
            type: "value-call",
          },
        },
        {
          type: "variable-reassignment",
          modifier: null,
          variable: {
            type: "value-identifier",
            token: { text: "x" },
          },
          operator: { text: "to" },
          call: {
            type: "value-call",
          },
        },
        {
          type: "blank-line",
        },
      ],
    })
  },
)
