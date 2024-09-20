import { checkExampleProgramTree, testParser } from ".."
import { returnStyle } from "../../../tree/block"

testParser("should parse example program types/assignment.thy", async () => {
  await checkExampleProgramTree("types/assignment.thy", {
    type: "block",
    ideas: [
      {
        type: "type-assignment",
        modifier: null,
        typeToken: {
          type: "Type",
          text: "type",
        },
        variable: {
          type: "type-identifier",
          token: {
            type: "TypeIdentifier",
            text: "MyNewType",
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
              text: "calculateSomeValue",
            },
          },
          typeArgs: [],
          args: [
            {
              type: "number-literal",
              token: {
                type: "NumberLiteral",
                text: "1",
              },
            },
            {
              type: "number-literal",
              token: {
                type: "NumberLiteral",
                text: "2",
              },
            },
            {
              type: "number-literal",
              token: {
                type: "NumberLiteral",
                text: "3",
              },
            },
          ],
        },
      },
      {
        type: "type-assignment",
        modifier: null,
        typeToken: {
          type: "Type",
          text: "type",
        },
        variable: {
          type: "type-identifier",
          token: {
            type: "TypeIdentifier",
            text: "MyNewType2",
          },
        },
        operator: {
          type: "ConstDeclAssign",
          text: "is",
        },
        call: {
          type: "type-call",
          func: {
            type: "type-identifier",
            token: {
              type: "TypeIdentifier",
              text: "Union",
            },
          },
          args: [
            {
              type: "string-literal",
            },
            {
              type: "string-literal",
            },
          ],
        },
      },
      {
        type: "blank-line",
      },
    ],
    returnStyle: "implicitExport",
  })
})
