import { checkExampleProgramTree, testParser } from ".."
import { returnStyle } from "../../../tree/block"

testParser("should parse example program blocks/call-continuance.thy", async () => {
  await checkExampleProgramTree("blocks/call-continuance.thy", {
    "type": "block",
    "ideas": [
      {
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
              "text": "someCondition"
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
                    "text": "doIfTrue"
                  }
                },
                "typeArgs": [],
                "args": []
              }
            ],
            "returnStyle": returnStyle.implicitExport
          },
          {
            "type": "atom",
            "token": {
              "type": "ValueIdentifier",
              "text": "else"
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
                    "text": "doIfFalse"
                  }
                },
                "args": []
              }
            ],
            "returnStyle": returnStyle.implicitExport
          }
        ]
      }
    ],
    "returnStyle": returnStyle.implicitExport
  })
})