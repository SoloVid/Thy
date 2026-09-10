import { test } from "test-framework"
import { expect } from "expect"
import { tReturn } from "../../token-kind.ts"
import { makeSimpleRegexMatcher } from "../match/simple-regex.ts"
import { makeMuncher } from "./muncher.ts"
import { LexState } from "../state.ts"

const matcher = makeSimpleRegexMatcher(tReturn, /\breturn\b/)

function makeState(): LexState {
  return {
    text: "return 5",
    offset: 0,
  }
}

test("makeMuncher() forwards null outputs", () => {
  const state = makeState()
  const muncher = makeMuncher(() => null)
  const actualResult = muncher(state)
  expect(actualResult).toStrictEqual(null)
})

test("makeMuncher() does not advance state if output null", () => {
  const state = makeState()
  const muncher = makeMuncher(() => null)
  void muncher(state)
  expect(state.offset).toBe(0)
})

test("makeMuncher() forwards non-null outputs", () => {
  const state = makeState()
  const muncher = makeMuncher(matcher)
  const actualResult = muncher(state)
  expect(actualResult).toStrictEqual({
    kind: tReturn,
    offset: 0,
    length: 6,
  })
})

test("makeMuncher() advances state for non-null output", () => {
  const state = makeState()
  const muncher = makeMuncher(matcher)
  void muncher(state)
  expect(state.offset).toBe(6)
})
