import { expect } from "expect"
import {
  tEndString,
  tEndStringInterpolation,
  tStartString,
  tStartStringInterpolation,
  tStringText,
  tTypeIdentifier,
  tValueIdentifier,
} from "tokenizer/token-type.ts"
import { badParse } from "./error.ts"
import { getNodeStructure, testParser } from "./example-test/index.ts"
import { parseStringInterpolation, parseStringLiteral } from "./parse-string.ts"
import { makeParserTestFixture } from "./test-helper.ts"

testParser("parseStringLiteral() should parse basic string", () => {
  const { errors, state } = makeParserTestFixture([
    tStartString,
    tStringText,
    tEndString,
  ])
  const result = parseStringLiteral(state)
  expect(errors).toEqual([])
  expect(getNodeStructure(result)).toEqual({
    type: "string-literal",
    parts: [
      {
        type: "string-content",
        token: {
          type: "StringText",
        },
      },
    ],
  })
})

testParser("parseStringLiteral() should parse empty string", () => {
  const { errors, state } = makeParserTestFixture([tStartString, tEndString])
  const result = parseStringLiteral(state)
  expect(errors).toEqual([])
  expect(getNodeStructure(result)).toEqual({
    type: "string-literal",
    parts: [],
  })
})

testParser(
  "parseStringLiteral() should parse string with multiple content parts",
  () => {
    const { errors, state } = makeParserTestFixture([
      tStartString,
      tStringText,
      tStringText,
      tEndString,
    ])
    const result = parseStringLiteral(state)
    expect(errors).toEqual([])
    expect(getNodeStructure(result)).toEqual({
      type: "string-literal",
      parts: [
        {
          type: "string-content",
          token: {
            type: "StringText",
          },
        },
        {
          type: "string-content",
          token: {
            type: "StringText",
          },
        },
      ],
    })
  },
)

testParser(
  "parseStringLiteral() should parse string with interpolation",
  () => {
    const { errors, state } = makeParserTestFixture([
      tStartString,
      tStringText,
      tStartStringInterpolation,
      tValueIdentifier,
      tEndStringInterpolation,
      tStartStringInterpolation,
      tValueIdentifier,
      tEndStringInterpolation,
      tStringText,
      tEndString,
    ])
    const result = parseStringLiteral(state)
    expect(errors).toEqual([])
    expect(getNodeStructure(result)).toEqual({
      type: "string-literal",
      parts: [
        {
          type: "string-content",
          token: {
            type: "StringText",
          },
        },
        {
          type: "string-interpolation",
          value: {
            type: "value-identifier",
            token: {
              type: "ValueIdentifier",
            },
          },
        },
        {
          type: "string-interpolation",
          value: {
            type: "value-identifier",
            token: {
              type: "ValueIdentifier",
            },
          },
        },
        {
          type: "string-content",
          token: {
            type: "StringText",
          },
        },
      ],
    })
  },
)

testParser(
  "parseStringLiteral() should error on unexpected token in string",
  () => {
    const expectedErrorToken = {
      type: tValueIdentifier,
      text: "lookImNotText",
    } as const
    const { errors, state } = makeParserTestFixture([
      tStartString,
      expectedErrorToken,
      tEndString,
    ])
    const result = parseStringLiteral(state)
    expect(errors).toEqual([
      {
        end: expectedErrorToken,
        message: "Unexpected token in string",
        start: expectedErrorToken,
      },
    ])
    expect(getNodeStructure(result)).toEqual({
      type: "string-literal",
      parts: [],
    })
  },
)

testParser(
  "parseStringLiteral() should error on unexpected start token",
  () => {
    const { state } = makeParserTestFixture([tEndString])
    expect(() => parseStringLiteral(state)).toThrow()
  },
)

testParser("parseStringLiteral() should error if string never ends", () => {
  const { state } = makeParserTestFixture([tStartString, tStringText])
  expect(() => parseStringLiteral(state)).toThrow()
})

testParser(
  "parseStringInterpolation() should error on unexpected token in string interpolation",
  () => {
    const expectedErrorToken = {
      type: tTypeIdentifier,
      text: "UnexpectedType",
    } as const
    const firstToken = {
      type: tStartStringInterpolation,
    } as const
    const { errors, state } = makeParserTestFixture([
      expectedErrorToken,
      tEndStringInterpolation,
    ])
    const result = parseStringInterpolation(state, firstToken as any)
    expect(errors).toEqual([
      {
        message: expect.stringContaining(
          "Unexpected token in string interpolation",
        ),
        start: expectedErrorToken,
        end: expectedErrorToken,
      },
    ])
    expect(result).toBe(badParse)
  },
)

testParser(
  "parseStringInterpolation() should error on unexpected extra tokens",
  () => {
    const expectedErrorToken = {
      type: tTypeIdentifier,
      text: "UnexpectedType",
    } as const
    const firstToken = {
      type: tStartStringInterpolation,
    } as const
    const { errors, state } = makeParserTestFixture([
      tValueIdentifier,
      expectedErrorToken,
      tEndStringInterpolation,
    ])
    const result = parseStringInterpolation(state, firstToken as any)
    expect(errors).toEqual([
      {
        message: expect.stringContaining(
          "Unexpected token in string interpolation",
        ),
        start: expectedErrorToken,
        end: expectedErrorToken,
      },
    ])
    expect(getNodeStructure(result)).toEqual({
      type: "string-interpolation",
      value: {
        type: "value-identifier",
        token: {
          type: "ValueIdentifier",
        },
      },
    })
  },
)

testParser(
  "parseStringInterpolation() should error if string interpolation never ends",
  () => {
    const { state } = makeParserTestFixture([
      tValueIdentifier,
      tValueIdentifier,
      tValueIdentifier,
    ])
    expect(() => parseStringInterpolation(state, null as any)).toThrow()
  },
)
