import { checkExampleProgramTree, testParser } from ".."
import { returnStyle } from "../../../tree/block"

testParser("should parse example program types/given.thy", async () => {
  await checkExampleProgramTree("types/given.thy", {
    "type": "block",
    "ideas": [
      {
        "type": "assignment",
        "modifier": null,
        "variable": {
          "type": "atom",
          "token": {
            "type": "ValueIdentifier",
            "text": "doSomeMath"
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
