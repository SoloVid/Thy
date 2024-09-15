import { checkExampleProgramTree, testParser } from ".."
import { returnStyle } from "../../../tree/block"

testParser("should parse example program blocks/immediately-invoked.thy", async () => {
  await checkExampleProgramTree("blocks/immediately-invoked.thy", {
    "type": "block",
    "ideas": [
      {
        "type": "assignment",
        "modifier": null,
        "variable": {
          "type": "atom",
          "token": {
            "type": "ValueIdentifier",
            "text": "myValue"
          }
        },
        "operator": {
          "type": "ConstantAssignment",
          "text": "is"
        },
        "call": {
          "type": "call",
          "func": {
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
                      "type": "NumberLiteral",
                      "text": "5"
                    }
                  }
                ]
              }
            ],
            "returnStyle": returnStyle.explicitReturn
          },
          "args": []
        }
      }
    ],
    "returnStyle": returnStyle.implicitExport
  })
})