# Thy Language Spec

Thy is a mobile-friendly programming language powered by [TypeScript](https://www.typescriptlang.org) (which is powered by [JavaScript](https://developer.mozilla.org/en-US/docs/Web/javascript)).

Every construct in Thy maps directly to some equivalent concept in TypeScript.
Some constructs may merely be referenced (and linked)
as their equivalents in TypeScript and documentation left to external sources.

## Overview

Here are some general rules for Thy program structure:

* Every program is a **block**
* Every **block** consists of **statements** (and non-code lines)
* Every **statement** contains exactly one **call**

## Blocks

Blocks are the **function** construct in Thy.

> In other C-like languages, the terms "function", "method", or "lambda"
> may describe similar constructs.

Blocks consist of a series of sequential [**statements**](#statements)
(and [non-code lines](#non-code-lines)).

```thy
This is a comment that does nothing
result is doOneThing

doAnotherThing result "yes"
```

Blocks may take some number of [parameters](#parameters-given)
and [return](#explicit-return-return) a value.

```thy
The first parameter is `a`.
a is given
The second parameter is `b`.
b is given

someValue is doSomeStuff a b

return someValue
```

Blocks in Thy are equivalent to [arrow functions in TypeScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions):

```js
(a, b) => {
  const someValue is doSomeStuff(a, b)
  return someValue
}
```

## Non-Code Lines

Empty lines and comments are ignored by Thy and can be used at the programmers discretion to aid readability of the program.

Comments in Thy are lines that start with a capital letter.

```thy
This is a comment
this is not
```

> Some other languages use something like `//` or `#` to begin a comment,
> but Thy aims not to use special characters for mobile-friendliness.

## Calls

A **call** in Thy consists of an **expression** to call
and some number of **arguments**.

Here is a most basic **call** in Thy:

```thy
doSomeImportantThing
```

This **call** executes the **function** `doSomeImportantThing`,
passing zero arguments to it.

> In other C-like languages, this would look like
> `doSomeImportantThing()`.

Any number of **arguments** can be passed in a **call**
in a space-separated list following the **function** **expression**:

```thy
calculateSomething a b c
```

> In other C-like languages, this would look like 
> `calculateSomething(a, b, c)`.

## Statements

A **statement** in Thy consists of exactly one **call** but comes in three variants:

1. Bare **call**
```thy
foo a b c
```
2. **Call** with assignment
```thy
myResult is foo a b c
```
3. `let` **statement**
```thy
let foo a b c
```

## Variable Assignments (`is`, `be`, `to`)

Although a **statement** in Thy may only have a **call**
(commonly for **functions** with side effects),
the return value of the call may be captured in a variable in the same statement.

```thy
myResult is foo a b c
```

In this example, the function `foo` is called with arguments `a`, `b`, and `c`,
and the return value of the call is stored in the variable `myResult`.

> In other C-like languages, this would look like
> `myResult = foo(a, b, c)`.

Thy provides three keywords (`is`, `be`, `to`) for assignment.
All three assign the return value of the call to the variable on the left,
but they have slightly different meanings.

### Immutable Assignment (`is`)

The `is` keyword in Thy is the assignment keyword that creates a new
immutable (constant) variable.
This variable cannot be subsequently reassigned.

```thy
First time here is good.
x is foo a b
Trying to reassign `x` is an error.
x is foo x c
```

The `is` keyword should be your go-to assignment keyword
since immutable variables are generally easier to maintain.

The `is` keyword in Thy corresponds to the [`const` keyword in TypeScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const):

```js
const x = foo(a, b)
```

### Mutable Assignment (`be`/`to`)

If a mutable variable is required, the `be` and `to` keywords in Thy
provide mutable assignment.
The `be` keyword creates a new mutable variable, and the `to` keyword
mutates (updates) an existing mutable variable.

```thy
First time use `be` to create.
x be foo a b
Then use `to` to reassign.
x to foo x c
x to foo x d
```

The `be` and `to` keywords should be avoided when possible
because mutable variables are generally more difficult to maintain.

The `be` keyword in Thy corresponds to the [`let` keyword in TypeScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let):

```js
let x = foo(a, b)
```

The `to` keyword in Thy corresponds to the [assignment (=) operator in TypeScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Assignment):

```js
x = foo(x, c)
```

## Parameters (`given`)

The special function `given` in Thy implies a positional parameter
input for the block and returns the value of the argument supplied by the caller.

```thy
param1 is given
param2 is given

doSomething param1 param2
```

If this block were assigned to the variable `foo` and called as

```thy
foo "a" 2
```

`param1` would be `"a"` and `param2` would be `2`.

## Explicit Return (`return`)

## No Return

## Early Return (`let`)

## Implicit Return (`export`/`private`)
