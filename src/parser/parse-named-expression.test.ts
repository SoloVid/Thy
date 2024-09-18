import { expect } from "expect"
import {
  tEndStream,
  tMemberAccessOperator,
  TokenType,
  tTypeIdentifier,
  tValueIdentifier,
} from "tokenizer/token-type"
import type { CompileError } from "../compile-error"
import type { Token } from "../tokenizer/token"
import type { Tokenizer } from "../tokenizer/tokenizer"
import { getNodeStructure, testParser } from "./example-test"
import type { ParserContext, ParserState } from "./parser-state"
import { makeTokenBuffer } from "./token-buffer"
import { parseAnyIndeterminateNamedExpression } from "./parse-named-expression"

function makeMockTokenizer(
  tokens: readonly (TokenType | Partial<Token>)[],
): Tokenizer {
  let i = 0
  return {
    getNextToken() {
      if (i >= tokens.length) {
        return { type: tEndStream } as Token
      }
      const t = tokens[i++]
      if (typeof t === "string") {
        return { type: t } as Token
      }
      return t as Token
    },
  }
}

function makeParserTestFixture(
  tokens: readonly (TokenType | Partial<Token>)[],
) {
  const errors: CompileError[] = []
  const state: ParserState = {
    buffer: makeTokenBuffer(makeMockTokenizer(tokens)),
    context: {
      // symbolTable: makeSymbolTable(),
      // takeThat: () => thatNotFound,
      // takeBeforeThat: () => thatNotFound,
    } as ParserContext,

    addError(e) {
      errors.push(e)
    },
  }
  return {
    errors,
    state,
  }
}

testParser(
  "parseAnyIndeterminateNamedExpression() should parse unscoped value identifier",
  () => {
    const { errors, state } = makeParserTestFixture([tValueIdentifier])
    const result = parseAnyIndeterminateNamedExpression(state)
    expect(errors).toEqual([])
    expect(getNodeStructure(result)).toEqual({
      token: { type: "ValueIdentifier" },
      type: "value-identifier",
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
      token: { type: "TypeIdentifier" },
      type: "type-identifier",
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
  "parseAnyIndeterminateNamedExpression() should error if type is base of scoped identifier",
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
