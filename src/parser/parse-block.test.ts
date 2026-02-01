import { expect } from "expect"
import { test } from "test-framework"
import { parseSource } from "./example-test/index.ts"

test("parse() should accept block that returns a number", async () => {
  const { top, errors } = parseSource(`return 5`)
  expect(errors).toMatchObject([])
})

test("parse() should reject `return` with no argument", async () => {
  const { top, errors } = parseSource(`return`)
  expect(errors).toMatchObject([
    {
      message: `"return" should receive exactly one argument`,
    },
  ])
})

test("parse() should reject `return` with too many arguments", async () => {
  const { top, errors } = parseSource(`return 1 2`)
  expect(errors).toMatchObject([
    {
      message: `"return" should not receive more than one argument`,
    },
  ])
})

test("parse() should reject export after let", async () => {
  const { top, errors } = parseSource(`let f\nexport a is f`)
  expect(errors).toMatchObject([
    {
      message: '"export" is incompatible with explicit return (or "let")',
    },
  ])
})

test("parse() should reject let after export", async () => {
  const { top, errors } = parseSource(`export a is f\nlet f`)
  expect(errors).toMatchObject([
    {
      message: '"let" is incompatible with export-style return',
    },
  ])
})

test("parse() should reject return after export", async () => {
  const { top, errors } = parseSource(`export a is f\nreturn 5`)
  expect(errors).toMatchObject([
    {
      message: "Explicit return is incompatible with export-style return",
    },
  ])
})

test("parse() should reject given with too many args", async () => {
  const { top, errors } = parseSource(`a is given 1 2`)
  expect(errors).toMatchObject([
    {
      message: '"given" call should not receive more than one argument',
    },
  ])
})

test("parse() should reject await call (no assign) with no arguments", async () => {
  const { top, errors } = parseSource(`await`)
  expect(errors).toMatchObject([
    {
      message: '"await" call should receive exactly one argument',
    },
  ])
})

test("parse() should reject await call (no assign) with too many arguments", async () => {
  const { top, errors } = parseSource(`await 1 1`)
  expect(errors).toMatchObject([
    {
      message: '"await" call should not receive more than one argument',
    },
  ])
})

test("parse() should reject await call (with assign) with no arguments", async () => {
  const { top, errors } = parseSource(`a is await`)
  expect(errors).toMatchObject([
    {
      message: '"await" call should receive exactly one argument',
    },
  ])
})

test("parse() should reject await call (with assign) with too many arguments", async () => {
  const { top, errors } = parseSource(`a is await 1 1`)
  expect(errors).toMatchObject([
    {
      message: '"await" call should not receive more than one argument',
    },
  ])
})

test("parse() should barf if block attempts to write (to) immutable variables from this scope's local block variables", async () => {
  const { top, errors } = parseSource(`x is def 5\nx to def 6\nreturn x`)
  expect(errors).toMatchObject([
    {
      message: '"x" is constant and cannot be reassigned',
    },
  ])
})

test("parse() should barf if block attempts to write (is) immutable variables from this scope's local block variables", async () => {
  const { top, errors } = parseSource(`x is def 5\nx is def 6\nreturn x`)
  expect(errors).toMatchObject([
    {
      message: '"x" is declared elsewhere and cannot be re-declared',
    },
  ])
})

test("parse() should barf if block attempts to write (be) immutable variables from this scope's local block variables", async () => {
  const { top, errors } = parseSource(`x is def 5\nx be def 6\nreturn x`)
  expect(errors).toMatchObject([
    {
      message: '"x" is declared elsewhere and cannot be re-declared',
    },
  ])
})

test("parse() should barf if block attempts to write immutable variable from closure", async () => {
  const { top, errors } = parseSource(
    `x is def 5\nfoo is def\n  bar is def\n    x to def 6\n  bar\nfoo\nreturn x`,
  )
  expect(errors).toMatchObject([
    {
      message: '"x" is constant and cannot be reassigned',
    },
  ])
})

test("parse() should barf if block attempts to redeclare (be) mutable variable", async () => {
  const { top, errors } = parseSource(`x be def 5\nx be def 6\nreturn x`)
  expect(errors).toMatchObject([
    {
      message: '"x" is declared elsewhere and cannot be re-declared',
    },
  ])
})

test("parse() should barf if block attempts to redeclare (is) mutable variable", async () => {
  const { top, errors } = parseSource(`x be def 5\nx is def 6\nreturn x`)
  expect(errors).toMatchObject([
    {
      message: '"x" is declared elsewhere and cannot be re-declared',
    },
  ])
})

test("parse() should barf if block attempts to write an undeclared variable", async () => {
  const { top, errors } = parseSource(`x to f`)
  expect(errors).toMatchObject([
    {
      message: '"x" is not declared in this scope',
    },
  ])
})

test("parse() should barf on `that` if value is unavailable", async () => {
  const { top, errors } = parseSource(`that`)
  expect(errors).toMatchObject([
    {
      message:
        "No preceding non-captured call available to substitute for that",
    },
  ])
})

test("parse() should allow `that` if value is available", async () => {
  const { top, errors } = parseSource(`foo\nthat`)
  expect(errors).toEqual([])
})

test("parse() should barf on `that` if value is unavailable though some available", async () => {
  const { top, errors } = parseSource(`foo\nthat that`)
  expect(errors).toMatchObject([
    {
      message:
        "No preceding non-captured call available to substitute for that",
    },
  ])
})
