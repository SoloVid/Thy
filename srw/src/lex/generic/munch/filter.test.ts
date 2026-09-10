import { expect } from "expect"
import { test } from "test-framework"
import { combineMatchers } from "../match/combine.ts"
import { makeSimpleRegexMatcher } from "../match/simple-regex.ts"
import { LexState } from "../state.ts"
import { filterMuncher } from "./filter.ts"
import { makeMuncher } from "./muncher.ts"

const returnMatcher = makeSimpleRegexMatcher("ret", /\breturn\b/)
const numberMatcher = makeSimpleRegexMatcher("num", /\b\d+\b/)
const spaceMatcher = makeSimpleRegexMatcher("space", / /)
const innerMuncher = makeMuncher(
  combineMatchers([returnMatcher, numberMatcher, spaceMatcher]),
)

function makeState(): LexState {
  return {
    text: "return 5",
    offset: 0,
  }
}

test("filterMuncher() returns null when whitelist empty", () => {
  const state = makeState()
  const muncher = filterMuncher(innerMuncher, [])
  const actualResult = muncher(state)
  expect(actualResult).toStrictEqual(null)
})

test("filterMuncher() forwards null output", () => {
  const state = makeState()
  state.offset = 1
  const muncher = filterMuncher(innerMuncher, ["ret"])
  const actualResult = muncher(state)
  expect(actualResult).toStrictEqual(null)
})

test("filterMuncher() forwards output when whitelist allows", () => {
  const state = makeState()
  const muncher = filterMuncher(innerMuncher, ["ret"])
  const actualResult = muncher(state)
  expect(actualResult).toStrictEqual({
    kind: "ret",
    offset: 0,
    length: 6,
  })
})

test("filterMuncher() filters outputs", () => {
  const state = makeState()
  const muncher = filterMuncher(innerMuncher, ["ret", "num"])

  const actualResult1 = muncher(state)
  expect(actualResult1).toStrictEqual({
    kind: "ret",
    offset: 0,
    length: 6,
  })

  // Note that the space is skipped.

  const actualResult2 = muncher(state)
  expect(actualResult2).toStrictEqual({
    kind: "num",
    offset: 7,
    length: 1,
  })
})
