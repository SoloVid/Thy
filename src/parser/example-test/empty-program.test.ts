import { checkProgramTree, testParser } from "."
import { returnStyle } from "../../tree/block"

testParser("should parse empty program", () => {
  checkProgramTree("", {
    type: "block",
    ideas: [
      {
        type: "blank-line",
      },
    ],
    returnStyle: returnStyle.implicitExport,
  })
})

testParser("should parse program with only new lines", () => {
  checkProgramTree("\n\n", {
    type: "block",
    ideas: [
      {
        type: "blank-line",
      },
      {
        type: "blank-line",
      },
      {
        type: "blank-line",
      },
    ],
    returnStyle: returnStyle.implicitExport,
  })
})
