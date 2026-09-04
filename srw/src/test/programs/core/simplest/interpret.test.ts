import { expectInterpret } from "@/test/common/expect-interpret.ts"
import { test } from "test-framework"

test("core/simplest interpret", async () => {
  await expectInterpret(import.meta.dirname, "source/main.thy", "return.json")
})
