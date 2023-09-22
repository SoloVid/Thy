import assert from "assert";
import { test, defineTestGroup } from "under-the-sun";
import { makeThy } from "./thy";

const testMakeThy = defineTestGroup("makeThy() ")

testMakeThy("should not run passed functions on construction", async () => {
  let flag = false
  makeThy({
    blocks: [() => {
      flag = true
    }]
  })
  assert(!flag, "Function should not have been called during construction")
})

testMakeThy("function should run all passed functions", async () => {
  let calledFlags = [false, false, false]
  let functions = calledFlags.map((e,i) => () => {
    calledFlags[i] = true
  })
  const thy = makeThy({
    blocks: functions,
  })
  thy()
  calledFlags.forEach((f, i) => {
    assert(f, `Function ${i} should have been called`)
  })
})

testMakeThy("function should allow accessing exported member", async () => {
  const thy = makeThy({
    blocks: [
      () => ({ a: 1 as const, b: 2 }),
      () => ({ c: "3" }),
      () => {},
    ] as const
  })
  const noOutput: void = thy()
  assert.strictEqual(noOutput, undefined, `thy() should return undefined (void)`)
  const aOutput: 1 = thy("a")
  assert.strictEqual(aOutput, 1, `thy("a") should be 1`)
  const bOutput: number = thy("b")
  assert.strictEqual(bOutput, 2, `thy("b") should be 2`)
  const cOutput: string = thy("c")
  assert.strictEqual(cOutput, "3", `thy("c") should be 3`)
})
