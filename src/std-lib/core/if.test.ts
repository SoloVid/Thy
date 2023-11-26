import assert from "assert";
import { test } from "under-the-sun";
import { ifBuiltin } from "./if";

test("if() should return true case value if condition is met", async () => {
  assert.strictEqual(ifBuiltin(true, () => 5), 5)
})

test("if() should call true case callback if condition is met", async () => {
  let called = false
  ifBuiltin(true, () => called = true)
  assert(called)
})

test("if() should return undefined if condition is not met and there is no else case", async () => {
  assert.strictEqual(ifBuiltin(false, () => 5), undefined)
})

test("if() should not call true case callback if condition is not met and there is no else case", async () => {
  let called = false
  ifBuiltin(false, () => called = true)
  assert(!called)
})

test("if() should return true (not else) case value if condition is met", async () => {
  assert.strictEqual(ifBuiltin(true, () => 5, "else", () => 6), 5)
})

test("if() should call true (not else) case callback if condition is met", async () => {
  let called = false
  ifBuiltin(true, () => called = true, "else", () => undefined)
  assert(called)
})

test("if() should not call true case callback if condition is not met and there is an else case", async () => {
  let called = false
  ifBuiltin(false, () => called = true, "else", () => undefined)
  assert(!called)
})

test("if() should return else (not true) case value if condition is not met", async () => {
  assert.strictEqual(ifBuiltin(false, () => 5, "else", () => 6), 6)
})

test("if() should call else (not true) case callback if condition is not met", async () => {
  let called = false
  ifBuiltin(false, () => undefined, "else", () => called = true)
  assert(called)
})

test("if() should not call else case callback if condition is met", async () => {
  let called = false
  ifBuiltin(true, () => undefined, "else", () => called = true)
  assert(!called)
})
