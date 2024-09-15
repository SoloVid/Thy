import { checkExampleProgramTree, testParser } from "../.."
import { returnStyle } from "../../../../tree/block"

testParser("should parse example program blocks/functions/io.thy", async () => {
  await checkExampleProgramTree("blocks/functions/io.thy", {
    "type": "block",
    "ideas": [
      {
        "type": "non-code",
        "token": {
          "type": "Comment",
          "text": "The first parameter is `a`."
        }
      },
      {
        "type": "assignment",
        "modifier": null,
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
              "text": "given"
            }
          },
          "args": []
        }
      },
      {
        "type": "non-code",
        "token": {
          "type": "Comment",
          "text": "The second parameter is `b`."
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
              "text": "given"
            }
          },
          "args": []
        }
      },
      {
        "type": "blank-line"
      },
      {
        "type": "assignment",
        "modifier": null,
        "variable": {
          "type": "atom",
          "token": {
            "type": "ValueIdentifier",
            "text": "someValue"
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
              "text": "doSomeStuff"
            }
          },
          "args": [
            {
              "type": "atom",
              "token": {
                "type": "ValueIdentifier",
                "text": "a"
              }
            },
            {
              "type": "atom",
              "token": {
                "type": "ValueIdentifier",
                "text": "b"
              }
            }
          ]
        }
      },
      {
        "type": "blank-line"
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
        "typeArgs": [],
        "args": [
          {
            "type": "atom",
            "token": {
              "type": "ValueIdentifier",
              "text": "someValue"
            }
          }
        ]
      }
    ],
    "returnStyle": returnStyle.explicitReturn
  })
})