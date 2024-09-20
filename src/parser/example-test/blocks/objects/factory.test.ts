import { checkExampleProgramTree, testParser } from "../.."
import { returnStyle } from "../../../../tree/block"

testParser(
  "should parse example program blocks/objects/factory.thy",
  async () => {
    await checkExampleProgramTree("blocks/objects/factory.thy", {
      type: "block",
      ideas: [
        {
          type: "constant-declaration",
          modifier: null,
          variable: {
            type: "value-identifier",
            token: {
              type: "ValueIdentifier",
              text: "makeMyThing",
            },
          },
          operator: {
            type: "ConstDeclAssign",
            text: "is",
          },
          call: {
            type: "value-call",
            func: {
              type: "value-identifier",
              token: {
                type: "ValueIdentifier",
                text: "def",
              },
            },
            args: [
              {
                type: "block",
                ideas: [
                  {
                    type: "constant-declaration",
                    modifier: null,
                    variable: {
                      type: "value-identifier",
                      token: {
                        type: "ValueIdentifier",
                        text: "propA",
                      },
                    },
                    operator: {
                      type: "ConstDeclAssign",
                      text: "is",
                    },
                    call: {
                      type: "value-call",
                      func: {
                        type: "value-identifier",
                        token: {
                          type: "ValueIdentifier",
                          text: "def",
                        },
                      },
                      args: [
                        {
                          type: "string-literal",
                          parts: [
                            {
                              type: "string-content",
                              token: {
                                type: "StringText",
                                text: "A",
                              },
                            },
                          ],
                        },
                      ],
                    },
                  },
                  {
                    type: "constant-declaration",
                    modifier: null,
                    variable: {
                      type: "value-identifier",
                      token: {
                        type: "ValueIdentifier",
                        text: "propB",
                      },
                    },
                    operator: {
                      type: "ConstDeclAssign",
                      text: "is",
                    },
                    call: {
                      type: "value-call",
                      func: {
                        type: "value-identifier",
                        token: {
                          type: "ValueIdentifier",
                          text: "calculateSomething",
                        },
                      },
                      args: [],
                    },
                  },
                  {
                    type: "constant-declaration",
                    modifier: null,
                    variable: {
                      type: "value-identifier",
                      token: {
                        type: "ValueIdentifier",
                        text: "useMyStuff",
                      },
                    },
                    operator: {
                      type: "ConstDeclAssign",
                      text: "is",
                    },
                    call: {
                      type: "value-call",
                      func: {
                        type: "value-identifier",
                        token: {
                          type: "ValueIdentifier",
                          text: "def",
                        },
                      },
                      args: [
                        {
                          type: "block",
                          ideas: [
                            {
                              type: "value-call",
                              func: {
                                type: "value-identifier",
                                token: {
                                  type: "ValueIdentifier",
                                  text: "doSomethingCool",
                                },
                              },
                              args: [
                                {
                                  type: "value-identifier",
                                  token: {
                                    type: "ValueIdentifier",
                                    text: "propA",
                                  },
                                },
                              ],
                            },
                            {
                              type: "value-call",
                              func: {
                                type: "value-identifier",
                                token: {
                                  type: "ValueIdentifier",
                                  text: "doSomethingElse",
                                },
                              },
                              args: [
                                {
                                  type: "value-identifier",
                                  token: {
                                    type: "ValueIdentifier",
                                    text: "propB",
                                  },
                                },
                              ],
                            },
                          ],
                          returnStyle: returnStyle.implicitExport,
                        },
                      ],
                    },
                  },
                ],
                returnStyle: returnStyle.implicitExport,
              },
            ],
          },
        },
        {
          type: "blank-line",
        },
        {
          type: "constant-declaration",
          modifier: null,
          variable: {
            type: "value-identifier",
            token: {
              type: "ValueIdentifier",
              text: "myThing1",
            },
          },
          operator: {
            type: "ConstDeclAssign",
            text: "is",
          },
          call: {
            type: "value-call",
            func: {
              type: "value-identifier",
              token: {
                type: "ValueIdentifier",
                text: "makeMyThing",
              },
            },
            args: [],
          },
        },
        {
          type: "constant-declaration",
          modifier: null,
          variable: {
            type: "value-identifier",
            token: {
              type: "ValueIdentifier",
              text: "myThing2",
            },
          },
          operator: {
            type: "ConstDeclAssign",
            text: "is",
          },
          call: {
            type: "value-call",
            func: {
              type: "value-identifier",
              token: {
                type: "ValueIdentifier",
                text: "makeMyThing",
              },
            },
            args: [],
          },
        },
        {
          type: "blank-line",
        },
        {
          type: "value-call",
          func: {
            type: "value-identifier",
            token: {
              type: "ValueIdentifier",
              text: "print",
            },
          },
          args: [
            {
              type: "value-property-access",
              base: {
                type: "value-identifier",
                token: {
                  type: "ValueIdentifier",
                  text: "myThing1",
                },
              },
              propertyAccesses: [
                {
                  memberAccessOperatorToken: {
                    type: "MemberAccessOperator",
                    text: ".",
                  },
                  propertyToken: {
                    type: "ValueIdentifier",
                    text: "propA",
                  },
                },
              ],
            },
          ],
        },
        {
          type: "value-call",
          func: {
            type: "value-property-access",
            base: {
              type: "value-identifier",
              token: {
                type: "ValueIdentifier",
                text: "myThing1",
              },
            },
            propertyAccesses: [
              {
                memberAccessOperatorToken: {
                  type: "MemberAccessOperator",
                  text: ".",
                },
                propertyToken: {
                  type: "ValueIdentifier",
                  text: "useMyStuff",
                },
              },
            ],
          },
          args: [],
        },
        {
          type: "blank-line",
        },
      ],
      returnStyle: returnStyle.implicitExport,
    })
  },
)
