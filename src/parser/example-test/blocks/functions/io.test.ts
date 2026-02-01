import { checkExampleProgramTree, testParser } from "../../index.ts"
import { returnStyle } from "../../../../tree/block.ts"

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
        type: "constant-declaration",
        modifier: null,
        variable: {
          type: "value-identifier",
          token: {
            type: "ValueIdentifier",
            text: "a",
          },
        },
        operator: {
          type: "ConstDeclAssign",
          text: "is",
        },
        call: {
          type: "given-call",
          func: {
            type: "given-term",
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
        type: "constant-declaration",
        modifier: null,
        variable: {
          type: "value-identifier",
          token: {
            type: "ValueIdentifier",
            text: "b",
          },
        },
        operator: {
          type: "ConstDeclAssign",
          text: "is",
        },
        call: {
          type: "given-call",
          func: {
            type: "given-term",
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
        type: "constant-declaration",
        modifier: null,
        variable: {
          type: "value-identifier",
          token: {
            type: "ValueIdentifier",
            text: "someValue",
          },
        },
        operator: {
          type: "ConstDeclAssign",
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
          type: "return-term",
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
