import { expectParse } from "@/test/common/expect-parse.ts"
import { test } from "test-framework"

test("core/simplest parse", async () => {
  await expectParse(import.meta.dirname, "source/main.thy", {
    type: "block",
    ideas: [
      {
        type: "return",
        func: { type: "return-term" },
        args: [{ type: "number-literal" }],
      },
    ],
  })
})
