import { expect } from "expect"
import { test } from "test-framework"
import { TokenMatcherResult } from "./matcher.ts"
import { makeSimpleRegexMatcher } from "./simple-regex.ts"

const matcher = makeSimpleRegexMatcher("r", /\breturn\b/)

test("makeSimpleRegexMatcher() matches exact text", () => {
  const expectedResult: TokenMatcherResult = {
    kind: "r",
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
    kind: "r",
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
    kind: "r",
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

test("makeSimpleRegexMatcher() can match newlines", () => {
  const expectedResult: TokenMatcherResult = {
    kind: "lf",
    length: 1,
  }
  const newlineMatcher = makeSimpleRegexMatcher("lf", /\n/)
  const actualResult = newlineMatcher({
    text: "return 5\nreturn 6",
    offset: 8,
  })
  expect(actualResult).toStrictEqual(expectedResult)
})

test("makeSimpleRegexMatcher() can match CRLF", () => {
  const expectedResult: TokenMatcherResult = {
    kind: "crlf",
    length: 2,
  }
  const newlineMatcher = makeSimpleRegexMatcher("crlf", /\r\n/)
  const actualResult = newlineMatcher({
    text: "return 5\r\nreturn 6",
    offset: 8,
  })
  expect(actualResult).toStrictEqual(expectedResult)
})
