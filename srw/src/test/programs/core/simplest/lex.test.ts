import { tNumber, tReturn } from "@/lex/token-kind.ts"
import { expectLex } from "@/test/common/expect-lex.ts"
import { test } from "test-framework"

test("core/simplest lex", async () => {
  await expectLex(import.meta.dirname, "source/main.thy", {
    tokens: [
      {
        kind: tReturn,
        offset: 0,
        length: 6,
      },
      {
        kind: tNumber,
        offset: 7,
        length: 1,
      },
    ],
  })
})
