import { expect } from "expect"
import { test } from "test-framework"
import { lex } from "./lex.ts"
import { combineMatchers } from "./match/combine.ts"
import { makeSimpleRegexMatcher } from "./match/simple-regex.ts"
import { makeMuncher } from "./munch/muncher.ts"
import { LexResult } from "./result.ts"

const returnMatcher = makeSimpleRegexMatcher("ret", /\breturn\b/)
const numberMatcher = makeSimpleRegexMatcher("num", /\b\d+\b/)
const spaceMatcher = makeSimpleRegexMatcher("space", / /)
const muncher = makeMuncher(
  combineMatchers([returnMatcher, numberMatcher, spaceMatcher]),
)

test("lex() produces expected tokens", () => {
  const expectedResult: LexResult = [
    {
      kind: "ret",
      offset: 0,
      length: 6,
    },
    {
      kind: "space",
      offset: 6,
      length: 1,
    },
    {
      kind: "num",
      offset: 7,
      length: 1,
    },
  ]
  const actualResult = lex("return 5", muncher)
  expect(actualResult).toStrictEqual(expectedResult)
})

test("lex() fills in error tokens for unexpected input (edges)", () => {
  const expectedResult: LexResult = [
    {
      kind: null,
      offset: 0,
      length: 5,
    },
    {
      kind: "ret",
      offset: 5,
      length: 6,
    },
    {
      kind: "space",
      offset: 11,
      length: 1,
    },
    {
      kind: null,
      offset: 12,
      length: 5,
    },
  ]
  const actualResult = lex("!@#$%return ERROR", muncher)
  expect(actualResult).toStrictEqual(expectedResult)
})

test("lex() fills in error tokens for unexpected input (middle)", () => {
  const expectedResult: LexResult = [
    {
      kind: "ret",
      offset: 0,
      length: 6,
    },
    {
      kind: null,
      offset: 6,
      length: 5,
    },
    {
      kind: "num",
      offset: 11,
      length: 1,
    },
  ]
  const actualResult = lex("return!@#$%5", muncher)
  expect(actualResult).toStrictEqual(expectedResult)
})
