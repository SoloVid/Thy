import { checkExampleProgramTree, testParser } from ".."
import { returnStyle } from "../../../tree/block"

testParser("should parse example program blocks/nested.thy", async () => {
  await checkExampleProgramTree("blocks/nested.thy", {
    "type": "block",
    "ideas": [
      {
        "type": "call",
        "func": {
          "type": "atom",
          "token": {
            "text": "if"
          }
        },
        "args": [
          {
            "type": "atom",
            "token": {
              "text": "condition1"
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
                    "text": "if"
                  }
                },
                "args": [
                  {
                    "type": "atom",
                    "token": {
                      "text": "condition2a"
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
                            "text": "if"
                          }
                        },
                        "args": [
                          {
                            "type": "atom",
                            "token": {
                              "text": "condition3"
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
                                    "text": "do3"
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
                  }
                ]
              },
              {
                "type": "call",
                "func": {
                  "type": "atom",
                  "token": {
                    "text": "if"
                  }
                },
                "args": [
                  {
                    "type": "atom",
                    "token": {
                      "text": "condition2b"
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
                            "text": "do2b"
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
          }
        ]
      }
    ],
    "returnStyle": returnStyle.implicitExport
  })
})
