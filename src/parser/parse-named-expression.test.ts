import { expect } from "expect"
import {
  tMemberAccessOperator,
  tNumberLiteral,
  tThat,
  tTypeIdentifier,
  tValueIdentifier,
} from "tokenizer/token-type"
import { getNodeStructure, testParser } from "./example-test"
import {
  parseAnyIndeterminateNamedExpression,
  parseIndeterminateNamedValueExpression,
} from "./parse-named-expression"
import { makeParserTestFixture } from "./test-helper"

testParser(
  "parseIndeterminateNamedValueExpression() should parse value",
  () => {
    const { errors, state } = makeParserTestFixture([tValueIdentifier])
    const result = parseIndeterminateNamedValueExpression(state)
    expect(errors).toEqual([])
    expect(getNodeStructure(result)).toEqual({
      type: "value-identifier",
      token: { type: "ValueIdentifier" },
    })
  },
)

testParser("parseIndeterminateNamedValueExpression() should parse that", () => {
  const { errors, state } = makeParserTestFixture([tThat])
  const result = parseIndeterminateNamedValueExpression(state)
  expect(errors).toEqual([])
  expect(getNodeStructure(result)).toEqual({
    type: "that",
    token: { type: "That" },
  })
})

testParser(
  "parseIndeterminateNamedValueExpression() should error if a type is processed",
  () => {
    const expectedErrorToken = {
      type: tTypeIdentifier,
      text: "UnexpectedType",
    } as const
    const { errors, state } = makeParserTestFixture([expectedErrorToken])
    const result = parseIndeterminateNamedValueExpression(state)
    expect(errors).toEqual([
      {
        message: expect.stringContaining("Unexpected type expression"),
        start: expectedErrorToken,
        end: expectedErrorToken,
      },
    ])
    expect(getNodeStructure(result)).toEqual({
      type: "error-value",
      token: expectedErrorToken,
    })
  },
)

testParser(
  "parseAnyIndeterminateNamedExpression() should error if an unexpected token comes up first",
  () => {
    const expectedErrorToken = {
      type: tNumberLiteral,
      text: "1234",
    } as const
    const { errors, state } = makeParserTestFixture([expectedErrorToken])
    const result = parseAnyIndeterminateNamedExpression(state)
    expect(errors).toEqual([
      {
        message: expect.stringContaining("Expected named expression"),
        start: expectedErrorToken,
        end: expectedErrorToken,
      },
    ])
    expect(getNodeStructure(result)).toEqual({
      type: "error-value",
      token: expectedErrorToken,
    })
  },
)

testParser(
  "parseAnyIndeterminateNamedExpression() should parse unscoped value identifier",
  () => {
    const { errors, state } = makeParserTestFixture([tValueIdentifier])
    const result = parseAnyIndeterminateNamedExpression(state)
    expect(errors).toEqual([])
    expect(getNodeStructure(result)).toEqual({
      type: "value-identifier",
      token: { type: "ValueIdentifier" },
    })
  },
)

testParser(
  "parseAnyIndeterminateNamedExpression() should parse unscoped type identifier",
  () => {
    const { errors, state } = makeParserTestFixture([tTypeIdentifier])
    const result = parseAnyIndeterminateNamedExpression(state)
    expect(errors).toEqual([])
    expect(getNodeStructure(result)).toEqual({
      type: "type-identifier",
      token: { type: "TypeIdentifier" },
    })
  },
)

testParser(
  "parseAnyIndeterminateNamedExpression() should parse scoped value identifier",
  () => {
    const { errors, state } = makeParserTestFixture([
      tValueIdentifier,
      tMemberAccessOperator,
      tValueIdentifier,
    ])
    const result = parseAnyIndeterminateNamedExpression(state)
    expect(errors).toEqual([])
    expect(getNodeStructure(result)).toEqual({
      type: "indeterminate-value-property-access",
      base: { type: "value-identifier", token: { type: "ValueIdentifier" } },
      propertyAccesses: [
        {
          memberAccessOperatorToken: { type: "MemberAccessOperator" },
          propertyToken: { type: "ValueIdentifier" },
        },
      ],
    })
  },
)

testParser(
  "parseAnyIndeterminateNamedExpression() should parse longer scoped value identifier",
  () => {
    const { errors, state } = makeParserTestFixture([
      tValueIdentifier,
      tMemberAccessOperator,
      tValueIdentifier,
      tMemberAccessOperator,
      tValueIdentifier,
    ])
    const result = parseAnyIndeterminateNamedExpression(state)
    expect(errors).toEqual([])
    expect(getNodeStructure(result)).toEqual({
      type: "indeterminate-value-property-access",
      base: { type: "value-identifier", token: { type: "ValueIdentifier" } },
      propertyAccesses: [
        {
          memberAccessOperatorToken: { type: "MemberAccessOperator" },
          propertyToken: { type: "ValueIdentifier" },
        },
        {
          memberAccessOperatorToken: { type: "MemberAccessOperator" },
          propertyToken: { type: "ValueIdentifier" },
        },
      ],
    })
  },
)

testParser(
  "parseAnyIndeterminateNamedExpression() should parse scoped type identifier",
  () => {
    const { errors, state } = makeParserTestFixture([
      tValueIdentifier,
      tMemberAccessOperator,
      tTypeIdentifier,
    ])
    const result = parseAnyIndeterminateNamedExpression(state)
    expect(errors).toEqual([])
    expect(getNodeStructure(result)).toEqual({
      type: "indeterminate-type-property-access",
      base: { type: "value-identifier", token: { type: "ValueIdentifier" } },
      propertyAccesses: [
        {
          memberAccessOperatorToken: { type: "MemberAccessOperator" },
          propertyToken: { type: "TypeIdentifier" },
        },
      ],
    })
  },
)

testParser(
  "parseAnyIndeterminateNamedExpression() should parse longer scoped type identifier",
  () => {
    const { errors, state } = makeParserTestFixture([
      tValueIdentifier,
      tMemberAccessOperator,
      tValueIdentifier,
      tMemberAccessOperator,
      tTypeIdentifier,
    ])
    const result = parseAnyIndeterminateNamedExpression(state)
    expect(errors).toEqual([])
    expect(getNodeStructure(result)).toEqual({
      type: "indeterminate-type-property-access",
      base: { type: "value-identifier", token: { type: "ValueIdentifier" } },
      propertyAccesses: [
        {
          memberAccessOperatorToken: { type: "MemberAccessOperator" },
          propertyToken: { type: "ValueIdentifier" },
        },
        {
          memberAccessOperatorToken: { type: "MemberAccessOperator" },
          propertyToken: { type: "TypeIdentifier" },
        },
      ],
    })
  },
)

testParser(
  "parseAnyIndeterminateNamedExpression() should error if type is base of scoped value identifier",
  () => {
    const expectedErrorToken = {
      type: tTypeIdentifier,
      text: "TypeWhereItDoesNotBelong",
    } as const
    const { errors, state } = makeParserTestFixture([
      expectedErrorToken,
      tMemberAccessOperator,
      tValueIdentifier,
    ])
    const result = parseAnyIndeterminateNamedExpression(state)
    expect(errors).toEqual([
      {
        message:
          '"TypeWhereItDoesNotBelong" is a type and cannot be dereferenced (.) for a value',
        start: expectedErrorToken,
        end: expectedErrorToken,
      },
    ])
    expect(getNodeStructure(result)).toEqual({
      token: { type: "ValueIdentifier" },
      type: "value-identifier",
    })
  },
)

testParser(
  "parseAnyIndeterminateNamedExpression() should error if type is somewhere in chain of scoped value identifier",
  () => {
    const expectedErrorToken = {
      type: tTypeIdentifier,
      text: "TypeWhereItDoesNotBelong",
    } as const
    const { errors, state } = makeParserTestFixture([
      tValueIdentifier,
      tMemberAccessOperator,
      tValueIdentifier,
      tMemberAccessOperator,
      expectedErrorToken,
      tMemberAccessOperator,
      tValueIdentifier,
      tMemberAccessOperator,
      tValueIdentifier,
    ])
    const result = parseAnyIndeterminateNamedExpression(state)
    expect(errors).toEqual([
      {
        message:
          '"TypeWhereItDoesNotBelong" is a type and cannot be dereferenced (.) for a value',
        start: expectedErrorToken,
        end: expectedErrorToken,
      },
    ])
    expect(getNodeStructure(result)).toEqual({
      type: "indeterminate-value-property-access",
      base: {
        type: "value-identifier",
        token: {
          type: "ValueIdentifier",
        },
      },
      propertyAccesses: [
        {
          memberAccessOperatorToken: {
            type: "MemberAccessOperator",
          },
          propertyToken: {
            type: "ValueIdentifier",
          },
        },
        {
          memberAccessOperatorToken: {
            type: "MemberAccessOperator",
          },
          propertyToken: {
            type: "ValueIdentifier",
          },
        },
      ],
    })
  },
)

testParser(
  "parseAnyIndeterminateNamedExpression() should error if there's a dangling member access operator",
  () => {
    const expectedErrorToken = {
      type: tMemberAccessOperator,
      text: ".",
    } as const
    const { errors, state } = makeParserTestFixture([
      tValueIdentifier,
      expectedErrorToken,
    ])
    const result = parseAnyIndeterminateNamedExpression(state)
    expect(errors).toEqual([
      {
        message: expect.stringContaining("Dangling member access operator"),
        start: expectedErrorToken,
        end: expectedErrorToken,
      },
    ])
    expect(getNodeStructure(result)).toEqual({
      token: { type: "ValueIdentifier" },
      type: "value-identifier",
    })
  },
)
