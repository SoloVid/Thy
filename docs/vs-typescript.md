# Thy vs. TypeScript

This page provides some direct comparisons of features in TypeScript
versus those in Thy.

## Basic Calls and Assignments

Every line in Thy has **exactly one function call**.
The output of the function can optionally be captured in a variable.

_Shhh! Don't tell anyone about the mutable variable form!_

```typescript
// Call a function imperatively
console.log("himom")

// Assign function output (to constant)
const o = JSON.parse("{}")

// Create mutable variable
let i = getInitialValue()
// Re-assign variable
i = i + 1
```

vs.

```thy
Call a function imperatively
print "himom"

Assign function output (to constant)
o is json.decode "{}"

Create mutable variable
i be getInitialValue
Re-assign variable
i to math.add i 1
```

## Conditionals

Conditionals in Thy are all done with the `if` _function_.

```typescript
if (a === b) {
  console.log("yes")
}
const c = a < b ? "less" : "more"
```

vs.

```thy
check.equal a b
if that
  print "yes"
check.asc a b
c is if that
  return "less"
and else
  return "more"
```

## Loops

Loops in Thy are all done with different `loop` functions.

Note: Thy has a dedicated keyword `let` to allow early returns,
since loops and conditionals are not a language-level construct.

```typescript
for (let i = 0; i < 10; i++) {
  console.log(i)
}
for (const e of arr) {
  console.log(e)
}
while (a < b) {
  console.log("still going")
}
```

vs.

```thy
loop.times 10
  private i is given
  print i
loop.elements arr
  e is given
  print e
  let
loop.forever
  check.asc a b
  check.not that
  let if that
    return null
  print "still going"
```

## Objects / Arrays

Objects are implemented as a language feature in Thy.
Arrays are built with a standard library function.

```typescript
const o = {
  a: {
    m: 5,
  },
  b: "hello",
}

const arr = [1, 2, 3]
```

vs.

```thy
o is
  a is
    m is def 5
  b is def "hello"

arr is array
  push 1
  push 2
  push 3
```

## Functions

Functions in Thy are more akin to arrow functions in TypeScript
than to traditional `function`s in JavaScript.

Note: Type inference and closure rules are similar in Thy to TypeScript.

```typescript
function foo(a: string, b: number = 5): boolean {
  return a + b
}
```

vs.

```thy
foo is def
  a is given String
  b is given Number 5
  type return Boolean
  math.add a b
  return that
```

## Error Handling (try/catch)

Error handling should feel pretty similar to TypeScript.
Again, like `if`, `try` is just a standard library function.

```typescript
try {
  throw new Error("Oh noes!")
} catch (e) {
  console.log(e)
}
```

vs.

```thy
try
  throw "Oh noes!"
and catch
  e is given
  print e
```

## Classes

Thy doesn't have classes, but you accomplish something very similar.

```typescript
class Thing {
  private secret: string
  public open: number

  constructor(n: number) {
    this.secret = randomUuid()
    this.open = number
  }

  gibMe() {
    return this.secret
  }
}

const myThing = new Thing(5)
```

vs.

```thy
makeThing is def
  private n is given Number
  private secret is randomUuid
  export open is def n

  export gibMe is def
    return secret
type Thing is makeThing

myThing is makeThing 5
```

Thy's format basically translates to an arrow function
returning an object literal.

Thy's `private` and `export` keywords can be optional depending on the context.

```typescript
const makeThing = (n: number) => {
  const secret = randomUuid()
  return {
    open: n,
    gibMe: () => {
      return secret
    },
  }
}

const myThing = makeThing(5)
```

vs.

```thy
makeThing is def
  n is given Number
  secret is randomUuid
  let
    open is def n
    gibMe is def
      return secret

myThing is makeThing 5
```

## Comments

Comments in Thy are lines that start with a capital letter.
Yes, this means that your variables all have to start with lower-case letters.

Multi-line comments in Thy are started with 3+ capital letters
and ended with the same sequence.

```typescript
// This is a one-line comment
console.log("")
/*
This is a multi-line comment
console.log("")
*/
console.log("")
```

vs.

```thy
This is a one-line comment
print ""
XYZ
This is a multi-line comment
print ""
XYZ
print ""
```
