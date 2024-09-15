import { checkExampleProgramTree, testParser } from "../.."
import { returnStyle } from "../../../../tree/block"

testParser("should parse example program blocks/functions/return-early.thy", async () => {
  await checkExampleProgramTree("blocks/functions/return-early.thy", {
    "type": "block",
    "ideas": [
      {
        "type": "let-call",
        "letToken": {
          "type": "Let",
          "text": "let"
        },
        "call": {
          "type": "call",
          "func": {
            "type": "atom",
            "token": {
              "type": "ValueIdentifier",
              "text": "if"
            }
          },
          "args": [
            {
              "type": "atom",
              "token": {
                "type": "ValueIdentifier",
                "text": "someEarlyReturnCondition"
              }
            },
            {
              "type": "block",
              "ideas": [
                {
                  "type": "call",
                  "func": {
                    "type": "atom",
                    "token": {
                      "type": "ValueIdentifier",
                      "text": "return"
                    }
                  },
                  "args": [
                    {
                      "type": "atom",
                      "token": {
                        "type": "ValueIdentifier",
                        "text": "someEarlyValue"
                      }
                    }
                  ]
                }
              ],
              "returnStyle": returnStyle.explicitReturn
            }
          ]
        }
      },
      {
        "type": "non-code",
        "token": {
          "type": "Comment",
          "text": "Do the heavy lifting logic down here."
        }
      },
      {
        "type": "call",
        "func": {
          "type": "atom",
          "token": {
            "type": "ValueIdentifier",
            "text": "return"
          }
        },
        "args": [
          {
            "type": "atom",
            "token": {
              "type": "ValueIdentifier",
              "text": "fullValue"
            }
          }
        ]
      }
    ],
    "returnStyle": returnStyle.explicitReturn
  })
})