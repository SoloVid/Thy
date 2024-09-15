import { checkExampleProgramTree, testParser } from "../.."
import { returnStyle } from "../../../../tree/block"

testParser("should parse example program blocks/functions/return-implicit-export-private.thy", async () => {
  await checkExampleProgramTree("blocks/functions/return-implicit-export-private.thy", {
    "type": "block",
    "ideas": [
      {
        "type": "assignment",
        "modifier": {
          "type": "Private",
          "text": "private"
        },
        "variable": {
          "type": "atom",
          "token": {
            "type": "ValueIdentifier",
            "text": "a"
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
              "text": "def"
            }
          },
          "args": [
            {
              "type": "atom",
              "token": {
                "type": "StringLiteral",
                "text": "\"A\""
              }
            }
          ]
        }
      },
      {
        "type": "assignment",
        "modifier": null,
        "variable": {
          "type": "atom",
          "token": {
            "type": "ValueIdentifier",
            "text": "b"
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
              "text": "def"
            }
          },
          "args": [
            {
              "type": "atom",
              "token": {
                "type": "NumberLiteral",
                "text": "2"
              }
            }
          ]
        }
      }
    ],
    "returnStyle": returnStyle.implicitExport
  })
})