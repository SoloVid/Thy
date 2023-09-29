import assert from "assert";
import { test, defineTestGroup } from "under-the-sun";
import { makeThy, ThyFunction } from "./thy";

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
  const provider1 = () => ({ a: 1 as const, b: 2 })
  const provider2 = () => ({ c: "3" })
  const provider3 = () => {}
  const thy = makeThy<{
    "a": typeof provider1
    "b": typeof provider1
    "c": typeof provider2
  }>({
    blocks: [
      provider1,
      provider2,
      provider3,
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

testMakeThy("function should allow components to access each other", async () => {
  // type MapToFunc<T extends Record<string, unknown>> = <Key extends keyof T>(key: Key) => T[Key]
  // type PartialThy<BlockExports extends Record<string, unknown>, Keys extends keyof BlockExports> = MapToFunc<Pick<BlockExports, Keys>>

  // type Thy = PartialThy<ProviderReturnMap, keyof ProviderReturnMap>
  type Thy = ThyFunction<ProviderMap>
  const provider1 = ({ thy }: { thy: Thy }) => {
    const c = thy("c")
    const a = `${c}A` as const
    return { a }
  }
  const provider2 = () => ({ b: "B" as const })
  const provider3 = ({ thy }: { thy: Thy }) => {
    const b = thy("b")
    const c = `${b}C` as const
    return { c }
  }
  const provider4 = () => {
    return { d: 5 }
  }
  type ProviderMap = {
    "a": typeof provider1
    "b": typeof provider2
    "c": typeof provider3
  }
  // type ProviderReturnMap = {
  //   "a": ReturnType<typeof provider1>
  //   "b": ReturnType<typeof provider2>
  //   "c": ReturnType<typeof provider3>
  // }
  const thy = makeThy<ProviderMap>({
    blocks: [
      provider1,
      provider2,
      provider3,
      // ({ thy }) => {
      //   const c = thy("c")
      //   const a = `${c}A`
      //   return { a }
      // },
      // () => ({ b: "B" }),
      // ({ thy }) => {
      //   const b = thy("b")
      //   const c = `${b}C`
      //   return { c }
      // },
    ] as const
  })
  const noOutput: void = thy()
  assert.strictEqual(noOutput, undefined, `thy() should return undefined (void)`)
  const aOutput: "BCA" = thy("a")
  assert.strictEqual(aOutput, "BCA", `thy("a") should be "BCA"`)
  const bOutput: "B" = thy("b")
  assert.strictEqual(bOutput, "B", `thy("b") should be "B"`)
  const cOutput: "BC" = thy("c")
  assert.strictEqual(cOutput, "BC", `thy("c") should be "BC"`)
})
