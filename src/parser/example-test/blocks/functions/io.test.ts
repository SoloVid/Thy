import { checkExampleProgramTree, testParser } from "../.."
import { returnStyle } from "../../../../tree/block"

testParser("should parse example program blocks/functions/io.thy", async () => {
  await checkExampleProgramTree("blocks/functions/io.thy", {
    type: "block",
    ideas: [
      {
        type: "comment",
        token: {
          type: "Comment",
          text: "The first parameter is `a`.",
        },
      },
      {
        type: "assignment",
        modifier: null,
        variable: {
          type: "value-identifier",
          token: {
            type: "ValueIdentifier",
            text: "a",
          },
        },
        operator: {
          type: "ConstantAssignment",
          text: "is",
        },
        call: {
          type: "given-call",
          func: {
            type: "given-atom",
            token: {
              type: "Given",
              text: "given",
            },
          },
          args: [],
        },
      },
      {
        type: "comment",
        token: {
          type: "Comment",
          text: "The second parameter is `b`.",
        },
      },
      {
        type: "assignment",
        modifier: null,
        variable: {
          type: "value-identifier",
          token: {
            type: "ValueIdentifier",
            text: "b",
          },
        },
        operator: {
          type: "ConstantAssignment",
          text: "is",
        },
        call: {
          type: "given-call",
          func: {
            type: "given-atom",
            token: {
              type: "Given",
              text: "given",
            },
          },
          args: [],
        },
      },
      {
        type: "blank-line",
      },
      {
        type: "assignment",
        modifier: null,
        variable: {
          type: "value-identifier",
          token: {
            type: "ValueIdentifier",
            text: "someValue",
          },
        },
        operator: {
          type: "ConstantAssignment",
          text: "is",
        },
        call: {
          type: "value-call",
          func: {
            type: "value-identifier",
            token: {
              type: "ValueIdentifier",
              text: "doSomeStuff",
            },
          },
          args: [
            {
              type: "value-identifier",
              token: {
                type: "ValueIdentifier",
                text: "a",
              },
            },
            {
              type: "value-identifier",
              token: {
                type: "ValueIdentifier",
                text: "b",
              },
            },
          ],
        },
      },
      {
        type: "blank-line",
      },
      {
        type: "return",
        func: {
          type: "return-atom",
          token: {
            type: "Return",
            text: "return",
          },
        },
        typeArgs: [],
        args: [
          {
            type: "value-identifier",
            token: {
              type: "ValueIdentifier",
              text: "someValue",
            },
          },
        ],
      },
      {
        type: "blank-line",
      },
    ],
    returnStyle: returnStyle.explicitReturn,
  })
})
