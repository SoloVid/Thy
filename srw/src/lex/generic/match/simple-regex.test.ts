import { expect } from "expect"
import { test } from "test-framework"
import { tReturn } from "../../token-kind.ts"
import { TokenMatcherResult } from "./matcher.ts"
import { makeSimpleRegexMatcher } from "./simple-regex.ts"

const matcher = makeSimpleRegexMatcher(tReturn, /\breturn\b/)

test("makeSimpleRegexMatcher() matches exact text", () => {
  const expectedResult: TokenMatcherResult = {
    kind: tReturn,
    length: 6,
  }
  const actualResult = matcher({
    text: "return",
    offset: 0,
  })
  expect(actualResult).toStrictEqual(expectedResult)
})

test("makeSimpleRegexMatcher() matches beginning of text", () => {
  const expectedResult: TokenMatcherResult = {
    kind: tReturn,
    length: 6,
  }
  const actualResult = matcher({
    text: "return 5",
    offset: 0,
  })
  expect(actualResult).toStrictEqual(expectedResult)
})

test("makeSimpleRegexMatcher() matches middle of text", () => {
  const expectedResult: TokenMatcherResult = {
    kind: tReturn,
    length: 6,
  }
  const actualResult = matcher({
    text: "5 return 5",
    offset: 2,
  })
  expect(actualResult).toStrictEqual(expectedResult)
})

test("makeSimpleRegexMatcher() does not match later text", () => {
  const actualResult = matcher({
    text: "5 return",
    offset: 0,
  })
  expect(actualResult).toStrictEqual(null)
})

test("makeSimpleRegexMatcher() does not match earlier text", () => {
  const actualResult = matcher({
    text: "return 5",
    offset: 7,
  })
  expect(actualResult).toStrictEqual(null)
})
