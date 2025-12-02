import { test } from "test-framework";
import { relative } from "./relative-paths";
import assert from "node:assert";

test("relative() should resolve self (top-level)", () => {
  relative
  assert.strictEqual(
    relative("blue.thy", "blue.thy"),
    "./blue.thy",
  )
})

test("relative() should resolve sibling (top-level)", () => {
  relative
  assert.strictEqual(
    relative("blue.thy", "red.thy"),
    "./red.thy",
  )
})

test("relative() should resolve self", () => {
  relative
  assert.strictEqual(
    relative("thing/animal/giraffe.thy", "thing/animal/giraffe.thy"),
    "./giraffe.thy",
  )
})

test("relative() should resolve sibling", () => {
  relative
  assert.strictEqual(
    relative("thing/animal/giraffe.thy", "thing/animal/rhino.thy"),
    "./rhino.thy",
  )
})

test("relative() should resolve unrelated", () => {
  relative
  assert.strictEqual(
    relative("hobby/biking.thy", "food/cookies.thy"),
    "../food/cookies.thy",
  )
})

test("relative() should resolve up", () => {
  relative
  assert.strictEqual(
    relative("thing/animal/dog/collie.thy", "thing/box.thy"),
    "../../box.thy",
  )
})

test("relative() should resolve down", () => {
  relative
  assert.strictEqual(
    relative("thing/box.thy", "thing/animal/dog/collie.thy"),
    "./animal/dog/collie.thy",
  )
})

test("relative() should resolve from longer to shorter", () => {
  relative
  assert.strictEqual(
    relative("thing/animal/cat/paw/brown.thy", "thing/animal/dog/collie.thy"),
    "../../dog/collie.thy",
  )
})

test("relative() should resolve from shorter to longer", () => {
  relative
  assert.strictEqual(
    relative("thing/animal/dog/collie.thy", "thing/animal/cat/paw/brown.thy"),
    "../cat/paw/brown.thy",
  )
})
