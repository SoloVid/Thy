import { checkExampleProgramTree, testParser } from ".."
import { returnStyle } from "../../../tree/block"

testParser("should parse example program types/assignment.thy", async () => {
  await checkExampleProgramTree("types/assignment.thy", {
    "type": "block",
    "ideas": [
      {
        "type": "type-assignment",
        "modifier": null,
        "typeToken": {
          "type": "Type",
          "text": "type"
        },
        "variable": {
          "type": "atom",
          "token": {
            "type": "TypeIdentifier",
            "text": "MyNewType"
          }
        },
        "operator": {
          "type": "ConstantAssignment",
          "text": "is"
        },
        "call": {
          "type": "call",
          "func": {
            "type": "atom",
            "token": {
              "type": "ValueIdentifier",
              "text": "calculateSomeValue"
            }
          },
          "typeArgs": [],
          "args": [
            {
              "type": "atom",
              "token": {
                "type": "NumberLiteral",
                "text": "1"
              }
            },
            {
              "type": "atom",
              "token": {
                "type": "NumberLiteral",
                "text": "2"
              }
            },
            {
              "type": "atom",
              "token": {
                "type": "NumberLiteral",
                "text": "3"
              }
            }
          ]
        }
      },
      {
        "type": "type-assignment",
        "modifier": null,
        "typeToken": {
          "type": "Type",
          "text": "type"
        },
        "variable": {
          "type": "atom",
          "token": {
            "type": "TypeIdentifier",
            "text": "MyNewType2"
          }
        },
        "operator": {
          "type": "ConstantAssignment",
          "text": "is"
        },
        "call": {
          "type": "type-call",
          "func": {
            "type": "atom",
            "token": {
              "type": "TypeIdentifier",
              "text": "Union"
            }
          },
          "args": [
            {
              "type": "atom",
              "token": {
                "type": "StringLiteral",
                "text": "\"a\""
              }
            },
            {
              "type": "atom",
              "token": {
                "type": "StringLiteral",
                "text": "\"b\""
              }
            }
          ]
        }
      }
    ],
    "returnStyle": "implicitExport"
  })
})
