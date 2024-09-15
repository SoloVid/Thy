import { checkExampleProgramTree, testParser } from ".."

testParser("should parse example program variables/unscoped-use.thy", async () => {
  await checkExampleProgramTree("variables/unscoped-use.thy", {
    type: "block",
    ideas: [
      {
        type: 'call',
        func: {
          type: 'atom',
          token: {
            text: 'foo'
          }
        },
        args: [
          { type: 'atom', token: { text: "a" } },
          { type: 'atom', token: { text: "b" } }
        ],
      }
    ],
  })
})
