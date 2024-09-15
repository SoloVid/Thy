import { checkExampleProgramTree, testParser } from ".."
import { returnStyle } from "../../../tree/block"

testParser("should parse example program types/return.thy", async () => {
  await checkExampleProgramTree("types/return.thy", {
    "type": "block",
    "ideas": [
      {
        "type": "assignment",
        "modifier": null,
        "variable": {
          "type": "atom",
          "token": {
            "type": "ValueIdentifier",
            "text": "myFunction"
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
          "typeArgs": [],
          "args": [
            {
              "type": "block",
              "ideas": [
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
                    "typeArgs": [
                      {
                        "type": "atom",
                        "token": {
                          "type": "TypeIdentifier",
                          "text": "Number"
                        }
                      }
                    ],
                    "args": []
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
                    "typeArgs": [
                      {
                        "type": "atom",
                        "token": {
                          "type": "TypeIdentifier",
                          "text": "Number"
                        }
                      }
                    ],
                    "args": []
                  }
                },
                {
                  "type": "type-call",
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
                        "type": "TypeIdentifier",
                        "text": "Number"
                      }
                    }
                  ]
                },
                {
                  "type": "blank-line"
                },
                {
                  "type": "non-code",
                  "token": {
                    "type": "Comment",
                    "text": "Do some math or something down here."
                  }
                }
              ],
              "returnStyle": returnStyle.implicitExport
            }
          ]
        }
      }
    ],
    "returnStyle": returnStyle.implicitExport
  })
})
