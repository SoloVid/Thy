import { checkExampleProgramTree, testParser } from "../.."
import { returnStyle } from "../../../../tree/block"

testParser("should parse example program blocks/objects/factory.thy", async () => {
  await checkExampleProgramTree("blocks/objects/factory.thy", {
    "type": "block",
    "ideas": [
      {
        "type": "assignment",
        "modifier": null,
        "variable": {
          "type": "atom",
          "token": {
            "type": "ValueIdentifier",
            "text": "makeMyThing"
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
                      "text": "propA"
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
                      "text": "propB"
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
                        "text": "calculateSomething"
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
                      "text": "useMyStuff"
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
                            "type": "call",
                            "func": {
                              "type": "atom",
                              "token": {
                                "type": "ValueIdentifier",
                                "text": "doSomethingCool"
                              }
                            },
                            "args": [
                              {
                                "type": "atom",
                                "token": {
                                  "type": "ValueIdentifier",
                                  "text": "propA"
                                }
                              }
                            ]
                          },
                          {
                            "type": "call",
                            "func": {
                              "type": "atom",
                              "token": {
                                "type": "ValueIdentifier",
                                "text": "doSomethingElse"
                              }
                            },
                            "args": [
                              {
                                "type": "atom",
                                "token": {
                                  "type": "ValueIdentifier",
                                  "text": "propB"
                                }
                              }
                            ]
                          }
                        ],
                        "returnStyle": returnStyle.implicitExport
                      }
                    ]
                  }
                }
              ],
              "returnStyle": returnStyle.implicitExport
            }
          ]
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
            "text": "myThing1"
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
              "text": "makeMyThing"
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
            "text": "myThing2"
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
              "text": "makeMyThing"
            }
          },
          "args": []
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
            "text": "print"
          }
        },
        "args": [
          {
            "type": "property-access",
            "base": {
              "type": "atom",
              "token": {
                "type": "ValueIdentifier",
                "text": "myThing1"
              }
            },
            "memberAccessOperatorToken": {
              "type": "MemberAccessOperator",
              "text": "."
            },
            "property": {
              "type": "ValueIdentifier",
              "text": "propA"
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
              "text": "myThing1"
            }
          },
          "memberAccessOperatorToken": {
            "type": "MemberAccessOperator",
            "text": "."
          },
          "property": {
            "type": "ValueIdentifier",
            "text": "useMyStuff"
          }
        },
        "args": []
      }
    ],
    "returnStyle": returnStyle.implicitExport
  })
})