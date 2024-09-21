import { expect } from "expect"
import {
  checkExampleProgramTokens,
  testTokenizer,
  tokenizeExampleProgram,
} from "./test-helper"
import {
  tComment,
  tEndString,
  tStartString,
  tStatementTerminator,
  tStringText,
  tTypeIdentifier,
  tValueIdentifier,
} from "./token-type"

testTokenizer("should tokenize Hello World", async () => {
  await checkExampleProgramTokens("hello-world.thy", [
    tComment,
    tStatementTerminator,
    tValueIdentifier,
    tStartString,
    tStringText,
    tEndString,
    tStatementTerminator,
    tStatementTerminator,
  ])
})

testTokenizer(
  "should tokenize example program types/arguments.thy",
  async () => {
    await checkExampleProgramTokens("types/arguments.thy", [
      tValueIdentifier,
      tTypeIdentifier,
      tTypeIdentifier,
      tValueIdentifier,
      tValueIdentifier,
      tStatementTerminator,
      tStatementTerminator,
    ])
  },
)

testTokenizer("should correctly track token locations", async () => {
  const { errors, outputs } = await tokenizeExampleProgram(
    "blocks/objects/factory.thy",
  )
  expect(errors).toEqual([])
  console.log(JSON.stringify(outputs))
  const outputsWithNoFinnickyWhitespace = JSON.parse(
    JSON.stringify(outputs, (key, value) =>
      key === "text" && /^[ \r\n]*$/.test(value) ? undefined : value,
    ),
  )
  expect(outputsWithNoFinnickyWhitespace).toEqual([
    {
      type: "ValueIdentifier",
      offset: 0,
      line: 0,
      column: 0,
      text: "makeMyThing",
    },
    { type: "ConstDeclAssign", offset: 12, line: 0, column: 12, text: "is" },
    { type: "ValueIdentifier", offset: 15, line: 0, column: 15, text: "def" },
    { type: "StartBlock", offset: 18, line: 0, column: 18 },
    { type: "ValueIdentifier", offset: 22, line: 1, column: 2, text: "propA" },
    { type: "ConstDeclAssign", offset: 28, line: 1, column: 8, text: "is" },
    { type: "ValueIdentifier", offset: 31, line: 1, column: 11, text: "def" },
    { type: "StartString", offset: 35, line: 1, column: 15, text: '"' },
    { type: "StringText", offset: 36, line: 1, column: 16, text: "A" },
    { type: "EndString", offset: 37, line: 1, column: 17, text: '"' },
    {
      type: "StatementTerminator",
      offset: 38,
      line: 1,
      column: 18,
    },
    { type: "ValueIdentifier", offset: 42, line: 2, column: 2, text: "propB" },
    { type: "ConstDeclAssign", offset: 48, line: 2, column: 8, text: "is" },
    {
      type: "ValueIdentifier",
      offset: 51,
      line: 2,
      column: 11,
      text: "calculateSomething",
    },
    {
      type: "StatementTerminator",
      offset: 69,
      line: 2,
      column: 29,
    },
    {
      type: "ValueIdentifier",
      offset: 73,
      line: 3,
      column: 2,
      text: "useMyStuff",
    },
    { type: "ConstDeclAssign", offset: 84, line: 3, column: 13, text: "is" },
    { type: "ValueIdentifier", offset: 87, line: 3, column: 16, text: "def" },
    { type: "StartBlock", offset: 90, line: 3, column: 19 },
    {
      type: "ValueIdentifier",
      offset: 96,
      line: 4,
      column: 4,
      text: "doSomethingCool",
    },
    {
      type: "ValueIdentifier",
      offset: 112,
      line: 4,
      column: 20,
      text: "propA",
    },
    {
      type: "StatementTerminator",
      offset: 117,
      line: 4,
      column: 25,
    },
    {
      type: "ValueIdentifier",
      offset: 123,
      line: 5,
      column: 4,
      text: "doSomethingElse",
    },
    {
      type: "ValueIdentifier",
      offset: 139,
      line: 5,
      column: 20,
      text: "propB",
    },
    { type: "StatementTerminator", offset: 144, line: 5, column: 25 },
    { type: "EndBlock", offset: 144, line: 5, column: 25 },
    { type: "StatementTerminator", offset: 144, line: 5, column: 25 },
    { type: "EndBlock", offset: 144, line: 5, column: 25 },
    {
      type: "StatementTerminator",
      offset: 144,
      line: 5,
      column: 25,
    },
    {
      type: "StatementTerminator",
      offset: 146,
      line: 6,
      column: 0,
    },
    {
      type: "ValueIdentifier",
      offset: 148,
      line: 7,
      column: 0,
      text: "myThing1",
    },
    { type: "ConstDeclAssign", offset: 157, line: 7, column: 9, text: "is" },
    {
      type: "ValueIdentifier",
      offset: 160,
      line: 7,
      column: 12,
      text: "makeMyThing",
    },
    {
      type: "StatementTerminator",
      offset: 171,
      line: 7,
      column: 23,
    },
    {
      type: "ValueIdentifier",
      offset: 173,
      line: 8,
      column: 0,
      text: "myThing2",
    },
    { type: "ConstDeclAssign", offset: 182, line: 8, column: 9, text: "is" },
    {
      type: "ValueIdentifier",
      offset: 185,
      line: 8,
      column: 12,
      text: "makeMyThing",
    },
    {
      type: "StatementTerminator",
      offset: 196,
      line: 8,
      column: 23,
    },
    {
      type: "StatementTerminator",
      offset: 198,
      line: 9,
      column: 0,
    },
    {
      type: "ValueIdentifier",
      offset: 200,
      line: 10,
      column: 0,
      text: "print",
    },
    {
      type: "ValueIdentifier",
      offset: 206,
      line: 10,
      column: 6,
      text: "myThing1",
    },
    {
      type: "MemberAccessOperator",
      offset: 214,
      line: 10,
      column: 14,
      text: ".",
    },
    {
      type: "ValueIdentifier",
      offset: 215,
      line: 10,
      column: 15,
      text: "propA",
    },
    {
      type: "StatementTerminator",
      offset: 220,
      line: 10,
      column: 20,
    },
    {
      type: "ValueIdentifier",
      offset: 222,
      line: 11,
      column: 0,
      text: "myThing1",
    },
    {
      type: "MemberAccessOperator",
      offset: 230,
      line: 11,
      column: 8,
      text: ".",
    },
    {
      type: "ValueIdentifier",
      offset: 231,
      line: 11,
      column: 9,
      text: "useMyStuff",
    },
    {
      type: "StatementTerminator",
      offset: 241,
      line: 11,
      column: 19,
    },
    {
      type: "StatementTerminator",
      offset: 243,
      line: 12,
      column: 0,
    },
  ])
})
