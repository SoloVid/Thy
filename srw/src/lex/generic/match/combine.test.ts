import { expect } from "expect"
import { test } from "test-framework"
import { tReturn } from "../../token-kind.ts"
import { combineMatchers } from "./combine.ts"
import { TokenMatcher, TokenMatcherResult } from "./matcher.ts"

const simpleResult: TokenMatcherResult = {
    kind: tReturn,
    length: 6,
  }

test("combineMatchers() matches nothing if no input", () => {
  const matcher = combineMatchers([])
  const actualResult = matcher({
    text: "hi",
    offset: 0,
  })
  expect(actualResult).toBe(null)
})

test("combineMatchers() stops after match", () => {
  const a: TokenMatcher = () => simpleResult
  let hitB = false
  const b: TokenMatcher = () => {
    hitB = true
    return null
  }
  const matcher = combineMatchers([a, b])
  const actualResult = matcher({
    text: "return",
    offset: 0,
  })
  expect(actualResult).toStrictEqual(simpleResult)
  expect(hitB).toBe(false)
})

test("combineMatchers() can match later matcher", () => {
  const a: TokenMatcher = () => null
  let hitB = false
  const b: TokenMatcher = () => {
    hitB = true
    return simpleResult
  }
  const matcher = combineMatchers([a, b])
  const actualResult = matcher({
    text: "return",
    offset: 0,
  })
  expect(hitB).toBe(true)
  expect(actualResult).toStrictEqual(simpleResult)
})

test("combineMatchers() returns null if no matches", () => {
  let hitA = false
  const a: TokenMatcher = () => {
    hitA = true
    return null
  }
  let hitB = false
  const b: TokenMatcher = () => {
    hitB = true
    return null
  }
  const matcher = combineMatchers([a, b])
  const actualResult = matcher({
    text: "return",
    offset: 0,
  })
  expect(hitA).toBe(true)
  expect(hitB).toBe(true)
  expect(actualResult).toBe(null)
})
