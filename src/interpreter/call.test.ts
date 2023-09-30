import assert from "node:assert"
import StackTracey from "stacktracey"
import { test } from "under-the-sun"
import { delay } from "../utils/delay"
import { interpretThyCall } from "./call"
import { makeSimpleContext } from "./test-helper"
import type { ThyBlockContext } from "./types"

function interpretThyCallBasic(context: ThyBlockContext, parts: readonly string[]) {
  return interpretThyCall(context, parts.map(p => ({text: p, lineIndex: 0, columnIndex: 0})))
}

test("interpretThyCall() should call a function", async () => {
  let called = false
  const context = makeSimpleContext({
    variablesInBlock: { f: () => called = true },
  })
  interpretThyCallBasic(context, [`f`])
  assert(called, "Function should have been called")
})

test("interpretThyCall() should call a function with arguments", async () => {
  let calledArgs: unknown = null
  const context = makeSimpleContext({
    variablesInBlock: { x: true, f: (...args: unknown[]) => calledArgs = args },
  })
  interpretThyCallBasic(context, [`f`, `x`, `"himom"`, `5`])
  assert.deepStrictEqual(calledArgs, [true, "himom", 5], "Function should have been called")
})

test("interpretThyCall() should return value from function called", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: () => 3.14 },
  })
  assert.strictEqual(interpretThyCallBasic(context, [`f`]), 3.14)
})

test("interpretThyCall() should barf on attempt to call non-function", async () => {
  const context = makeSimpleContext({
    variablesInBlock: { f: 5 },
  })
  assert.throws(() => interpretThyCallBasic(context, [`f`]), /f is not a function/)
})

test("interpretThyCall() should return context arguments for given", async () => {
  const context = makeSimpleContext({
    argsToUse: ["a", "b"],
  })
  assert.strictEqual(interpretThyCallBasic(context, [`given`]), "a")
  assert.strictEqual(interpretThyCallBasic(context, [`given`]), "b")
})

test("interpretThyCall() should set givenUsed when given called", async () => {
  const context = makeSimpleContext({
    argsToUse: ["a", "b"],
    givenUsed: false,
  })
  interpretThyCallBasic(context, [`given`])
  assert(context.givenUsed, "givenUsed should have been set")
})

test("interpretThyCall() should return default values for given if args array is exhausted", async () => {
  const context = makeSimpleContext({
    argsToUse: [],
  })
  assert.strictEqual(interpretThyCallBasic(context, [`given`, `"a"`]), "a")
  assert.strictEqual(interpretThyCallBasic(context, [`given`, `"b"`]), "b")
})

test("interpretThyCall() should barf if there are no args or defaults for given", async () => {
  const context = makeSimpleContext({
    argsToUse: [],
  })
  assert.throws(() => interpretThyCallBasic(context, [`given`]), /No argument or default available for given/)
})

test("interpretThyCall() should barf if given is used after implicit argument", async () => {
  const context = makeSimpleContext({
    argsToUse: [{ a: 1 }],
    implicitArguments: { a: 1 },
    implicitArgumentFirstUsed: "a",
  })
  assert.throws(() => interpretThyCallBasic(context, [`given`]), /\`given\` cannot be used after implicit arguments are used/)
})

test("interpretThyCall() should properly pass `this` in function call", async () => {
  class C {
    a = 5
    f() {
      return this.a
    }
  }

  const context = makeSimpleContext({
    variablesInBlock: { o: new C() },
  })
  assert.strictEqual(interpretThyCallBasic(context, [`o.f`]), 5)
})

// test("interpretThyCall() should provide Thy stack trace when error is thrown", async () => {
//   const context = makeSimpleContext({
//     variablesInBlock: {
//       foo: () => {
//         throw new Error("himom")
//       }
//     },
//   })

//   // Force into homogenous async stack traces.
//   await delay(10)

//   const errorHere = new Error("here")
//   console.log(errorHere.stack)
//   const errorHereStack = new StackTracey(errorHere)
//   // console.log(errorHere.stack)
//   // console.log(errorHereStack.items)

//   let actualError: unknown = null
//   try {
//     interpretThyCallBasic(context, [`foo`])
//   } catch (e) {
//     actualError = e
//   }
//   assert.notStrictEqual(actualError, null, "Error should be thrown")
//   assert(actualError instanceof Error)
//   console.log(actualError.stack)
//   console.log("==")
//   console.log(actualError.stack.split("\n").slice(errorHere.stack?.split("\n").length).join("\n"))
//   console.log("==")
//   const actualErrorStack = new StackTracey(actualError)
//   // console.log(actualErrorStack.items)
//   const uniqueStackItems = actualErrorStack.items.slice(0, -errorHereStack.items.length)
//   // console.log(uniqueStackItems)
//   assert.deepStrictEqual(uniqueStackItems, ["blah"])

//   // assert.throws(() => interpretThyCall(context, [`foo`]), (e) => {
//   //   assert(e instanceof Error)
//   //   console.log(e.stack)
//   //   assert.strictEqual(e.stack, errorHere.stack)
//   //   return true
//   // })
// })
