import { checkExampleProgramTree, testParser } from "../.."
import { returnStyle } from "../../../../tree/block"

testParser("should parse example program blocks/functions/reuse.thy", async () => {
  await checkExampleProgramTree("blocks/functions/reuse.thy", {
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
                        "text": "someValue"
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
        "type": "blank-line"
      },
      {
        "type": "non-code",
        "token": {
          "type": "Comment",
          "text": "And later..."
        }
      },
      {
        "type": "call",
        "func": {
          "type": "atom",
          "token": {
            "type": "ValueIdentifier",
            "text": "myFunction"
          }
        },
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
          }
        ]
      }
    ],
    "returnStyle": returnStyle.implicitExport
  })
})