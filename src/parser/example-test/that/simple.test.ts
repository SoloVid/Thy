import { checkExampleProgramTree, testParser } from ".."
import { returnStyle } from "../../../tree/block"

testParser("should parse example program that/simple.thy", async () => {
  await checkExampleProgramTree("that/simple.thy", {
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
            "type": "call",
            "func": {
              "type": "property-access",
              "base": {
                "type": "atom",
                "token": {
                  "type": "ValueIdentifier",
                  "text": "check"
                }
              },
              "memberAccessOperatorToken": {
                "type": "MemberAccessOperator",
                "text": "."
              },
              "property": {
                "type": "ValueIdentifier",
                "text": "all"
              }
            },
            "args": [
              {
                "type": "call",
                "func": {
                  "type": "property-access",
                  "base": {
                    "type": "atom",
                    "token": {
                      "type": "ValueIdentifier",
                      "text": "check"
                    }
                  },
                  "memberAccessOperatorToken": {
                    "type": "MemberAccessOperator",
                    "text": "."
                  },
                  "property": {
                    "type": "ValueIdentifier",
                    "text": "equal"
                  }
                },
                "args": [
                  {
                    "type": "atom",
                    "token": {
                      "type": "ValueIdentifier",
                      "text": "foo"
                    }
                  },
                  {
                    "type": "atom",
                    "token": {
                      "type": "StringLiteral",
                      "text": "\"A\""
                    }
                  }
                ]
              },
              {
                "type": "call",
                "func": {
                  "type": "property-access",
                  "base": {
                    "type": "atom",
                    "token": {
                      "type": "ValueIdentifier",
                      "text": "check"
                    }
                  },
                  "memberAccessOperatorToken": {
                    "type": "MemberAccessOperator",
                    "text": "."
                  },
                  "property": {
                    "type": "ValueIdentifier",
                    "text": "equal"
                  }
                },
                "args": [
                  {
                    "type": "atom",
                    "token": {
                      "type": "ValueIdentifier",
                      "text": "bar"
                    }
                  },
                  {
                    "type": "atom",
                    "token": {
                      "type": "NumberLiteral",
                      "text": "2"
                    }
                  }
                ]
              }
            ]
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
                    "text": "doSomething"
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
