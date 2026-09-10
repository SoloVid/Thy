import { expect } from "expect"
import { test } from "test-framework"
import { tNumber, tReturn, tWhitespace } from "../../token-kind.ts"
import { combineMatchers } from "../match/combine.ts"
import { makeSimpleRegexMatcher } from "../match/simple-regex.ts"
import { LexState } from "../state.ts"
import { filterMuncher } from "./filter.ts"
import { makeMuncher } from "./muncher.ts"

const returnMatcher = makeSimpleRegexMatcher(tReturn, /\breturn\b/)
const numberMatcher = makeSimpleRegexMatcher(tNumber, /\b\d+\b/)
const spaceMatcher = makeSimpleRegexMatcher(tWhitespace, / /)
const innerMuncher = makeMuncher(combineMatchers([returnMatcher, numberMatcher, spaceMatcher]))

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
  const muncher = filterMuncher(innerMuncher, [tReturn])
  const actualResult = muncher(state)
  expect(actualResult).toStrictEqual(null)
})

test("filterMuncher() forwards output when whitelist allows", () => {
  const state = makeState()
  const muncher = filterMuncher(innerMuncher, [tReturn])
  const actualResult = muncher(state)
  expect(actualResult).toStrictEqual({
    kind: tReturn,
    offset: 0,
    length: 6,
  })
})

test("filterMuncher() filters outputs", () => {
  const state = makeState()
  const muncher = filterMuncher(innerMuncher, [tReturn, tNumber])

  const actualResult1 = muncher(state)
  expect(actualResult1).toStrictEqual({
    kind: tReturn,
    offset: 0,
    length: 6,
  })

  // Note that the space is skipped.

  const actualResult2 = muncher(state)
  expect(actualResult2).toStrictEqual({
    kind: tNumber,
    offset: 7,
    length: 1,
  })
})
