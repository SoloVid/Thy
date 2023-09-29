import assert from "assert";
import { defineTestGroup } from "under-the-sun";
import { assertType } from "../utils/assert";
import { permute } from "../utils/permute";
import type { DebugNever } from "../utils/utility-types";
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

testMakeThy("function should run all functions once", async () => {
  let calledTimes = [0, 0]
  let functions = calledTimes.map((e, i) => () => {
    calledTimes[i]++
  })
  const thy = makeThy({
    blocks: functions,
  })
  thy()
  thy()
  calledTimes.forEach((f, i) => {
    assert.strictEqual(f, 1, `Function ${i} should have been called exactly once but was called ${f} times`)
  })
})

const permutations3 = permute([0, 1, 2])

for (const perm of permutations3) {
  testMakeThy(`function should allow accessing exported member (order ${JSON.stringify(perm)})`, async () => {
    const provider1 = () => ({ a: 1 as const, b: 2 })
    const provider2 = () => ({ c: "3" })
    const provider3 = () => {}
    const thy = makeThy<{
      "a": typeof provider1
      "b": typeof provider1
      "c": typeof provider2
    }>({
      blocks: perm.map((i) => ([
        provider1,
        provider2,
        provider3,
      ] as const)[i])
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

  testMakeThy(`function should allow components to access each other (order ${JSON.stringify(perm)})`, async () => {
    const provider1 = () => ({ a: "A" as const })
    const provider2 = ({ thy }: { thy: Thy }) => {
      const a = thy("a")
      return { ab: `${a}B` as const }
    }
    const provider3 = ({ thy }: { thy: Thy }) => {
      const ab = thy("ab")
      return { abc: `${ab}C` as const }
    }
    type ProviderMap = {
      "a": typeof provider1
      "ab": typeof provider2
      "abc": typeof provider3
    }
    type Thy = ThyFunction<ProviderMap>
    const thy = makeThy<ProviderMap>({
      blocks: perm.map((i) => ([
        provider1,
        provider2,
        provider3,
      ] as const)[i])
    })
    const noOutput = thy()
    assertType<void>(noOutput)
    assert.strictEqual(noOutput, undefined, `thy() should return undefined (void)`)
    const aOutput = thy("a")
    assertType<"A">(aOutput)
    assert.strictEqual(aOutput, "A", `thy("a") should be "A"`)
    const abOutput = thy("ab")
    assertType<"AB">(abOutput)
    assert.strictEqual(abOutput, "AB", `thy("ab") should be "AB"`)
    const abcOutput = thy("abc")
    assertType<"ABC">(abcOutput)
    assert.strictEqual(abcOutput, "ABC", `thy("abc") should be "ABC"`)
  })
}

testMakeThy("function should error on bad key", async () => {
  const provider1 = () => {
    return { a: "A" as const }
  }
  type ProviderMap = {
    "a": typeof provider1
  }
  const thy = makeThy<ProviderMap>({
    blocks: [
      provider1,
    ] as const
  })
  assert.throws(() => {
    // @ts-expect-error thy() should not allow invalid key
    thy("b")
  }, /"b" not found/)
})

testMakeThy("function should reject bad typing", async () => {
  const provider1 = () => {
    return { a: "A", b: "B" } as const
  }
  type ProviderMap = {
    "a": typeof provider1
    "b": typeof provider1
  }
  const thy = makeThy<ProviderMap>({
    blocks: [
      provider1,
    ] as const
  })
  const aOutputImplicit = thy("a")
  assertType<"A">(aOutputImplicit)
  assertType<"A">(thy("a"))
  // @ts-expect-error thy() should not allow type mismatch
  assertType<"no">(thy("a"))
  // @ts-expect-error thy() should not allow type mismatch, even if good for other dependency
  assertType<"B">(thy("a"))
  assertType<"B">(thy("b"))
})

testMakeThy("function should reject bad provider map", async () => {
  const provider1 = () => ({ a: 1 as const })
  type ProviderMap = {
    "b": typeof provider1
  }
  const thy = makeThy<ProviderMap>({
    blocks: [
      provider1,
    ] as const
  })
  assert.throws(() => {
    const bOutput = thy("b")
    // @ts-expect-error bOutput should not be never
    assertType<"C">(bOutput)
    assertType<DebugNever<[string, string]>>(bOutput)
  }, /"b" not found/)
})

testMakeThy("function should reject overlapping definitions", async () => {
  const provider1 = () => ({ a: 1 as const })
  const provider2 = () => ({ a: 2 as const })
  type ProviderMap = {
    "a": typeof provider1
  }
  const thy = makeThy<ProviderMap>({
    // @ts-expect-error blocks is invalid here
    blocks: [
      provider1,
      provider2,
    ] as const
  })
  assert.throws(() => {
    thy("a")
  }, /"a" defined multiple times/)
})
