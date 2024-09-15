import { checkExampleProgramTree, testParser } from ".."

testParser(
  "should parse example program variables/mutable-assignment.thy",
  async () => {
    await checkExampleProgramTree("variables/mutable-assignment.thy", {
      type: "block",
      ideas: [
        {
          type: "assignment",
          modifier: null,
          variable: {
            type: "atom",
            token: { text: "x" },
          },
          operator: { text: "be" },
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
          operator: { text: "to" },
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
          operator: { text: "to" },
          call: {
            type: "call",
          },
        },
      ],
    })
  },
)
