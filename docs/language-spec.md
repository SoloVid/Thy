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

## Expressions

There are 4 types of expressions in Thy:

1. Identifier expressions (e.g. `myNumber` or `myThing.topField.innerField`)
2. Block literals
3. String literals (e.g. `"hi mom"`)
4. Number literals (e.g. `123.45`)

All of these types of expressions can be used as arguments to calls.

> Unlike other C-like languages, calls are not expressions,
> so nested calls like `foo(bar(baz()))` require multiple statements in Thy.

> Unlike other C-like languages, Thy does not have dedicated keywords
> for constructs like `true`, `false`, and `null`.
> These values are instead provided as part of the core standard library,
> and fall under the category of "identifier expressions" above.

### Identifier Expressions

Identifiers in Thy limited to letters and numbers
and must begin with a lower-case letter.
`my32Foo` is an example of a valid identifier.

An unscoped identifier refers to a local variable within the current block context.

```thy
myId is def 5
doSomethingWithId myId
```

A scoped identifier behaves the same as [property accesses in TypeScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects#accessing_properties).

```thy
myObject.myId to def 5
myService.doSomethingWithId myObject.myId
```

### Block Literals

Although the program itself as a whole is a [block](#blocks) in Thy,
smaller (than the whole program) [blocks](#blocks) can also be used as expressions.

Block literals are denoted by indentation in Thy.

```thy
if someCondition
  doOneThing
  doAnother
keepDoingMoreStuff
```

In this example, the `if` function was called with two arguments:
`someCondition` and the two-line block literal
(with `doOneThing` and `doAnother` calls).
The block started with the newline and indent after `someCondition`
and ended with the newline and "outdent" before `keepDoingMoreStuff`.

> In other C-like languages, blocks are often denoted
> with an open curly brace `{` to start
> and a close curly brace `}` to end,
> but note that blocks in other C-like languages are generally not functions.

Block literals can be nested with arbitrary depth.

```thy
if condition1
  if condition2a
    if condition3
      do3
  if condition2b
    do2b
```

#### Call Continuance (`and`)

Because a function may take additional parameters after a block literal,
the `and` keyword in Thy allows additional arguments after a block literal argument.

```thy
if someCondition
  doIfTrue
and else
  doIfFalse
```

In this example, the `if` function was called with four arguments:
`someCondition`, the block literal calling `doIfTrue`,
`else`, and the block literal calling `doIfFalse`.

### String Literals

[String](#strings) literals can be specified in Thy with quotation marks,
similar to other C-like languages.

```thy
myString is def "this is my string"
```

#### Multiline Strings

Thy also has a multiline string literal support via `"""` and indentation:

```thy
myString is def """
  line 1

  line 3
This comment is not part of the string.
```

In a multiline string, leading indentation and any trailing newlines are stripped.
In the preceding example, the string value (formatted in JSON)
is `"line 1\n\nline3"`.

#### String Interpolation

Thy supports string interpolation of _unscoped_ variables
by specifying the variable name surrounded by periods.

```thy
myName is def "Grant"
print "Hello, .myName."
```

The `.variableName.` interpolation syntax in Thy
corresponds to the [`${variableName}` interpolation syntax in TypeScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#string_interpolation).

String interpolation can be used in single-line and multiline strings.

### Number Literals

[Number](#numbers) literals can be specified in Thy as [in TypeScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#numeric_literals),
albeit a more limited set of options.

```thy
crunchSomeNumbers 1 -3.14 9999999999.000000000001
```

In this example, three numbers were passed as arguments to `crunchSomeNumbers`.

## Statements

A **statement** in Thy contains exactly one **call**,
but there are three variants:

1. Bare **calls**
```thy
foo a b c
```
2. **Calls** with variable assignment
```thy
myResult is foo a b c
```
3. `let` **statements**
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

### Immutable Assignments (`is`)

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

### Mutable Assignments (`be`/`to`)

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

Note that the `to` keyword will always be the keyword used
for assignment to object properties.

```thy
myThing.someProp to foo a b
```

### Implicit Assignments (`that`/`beforeThat`)

If a call's return value is not captured via explicit variable assignment,
it is implicitly available as `that` in the next statement
and as `beforeThat` in the statement after that.

A common pattern of usage would be something like this:

```thy
check.equal foo "A"
check.equal bar 2
check.all that beforeThat
if that
  doSomething
```

The example above is logically equivalent to the following:

```thy
r1 is check.equal foo "A"
r2 is check.equal bar 2
r3 is check.all r1 r2
r4 is if r3
  r5 is doSomething
```

The `that` and `beforeThat` keywords in Thy minimize
the unnecessary proliferation of variable names
that would otherwise come with the one-call-per-statement design of Thy.

## Parameters

### Explicit Parameters (`given`)

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

### Implicit Parameters

If a block contains no `given` calls, it implicitly receives
a single object parameter (defaulting to empty object).
This object parameter does not have a name, but its properties are expanded
so that all of those property names become available unscoped within the block.

```thy
switch myInput
  case "foo"
    doSomething
  case "bar"
    doSomethingElse
  default
    freakOut
```

In this example, the top-level block has no `given` calls,
so it receives an implicit object parameter whose properties expand
into block-level variables which include `switch`.

The `switch` function is passed two arguments: `myInput` and the block literal.
The inner block literal has no `given` calls,
so it receives an implicit object parameter whose properties expand
into block-level variables which include `case` and `default`.

To put it differently, the same preceding example program could be written like this:

```thy
globals is given

globals.switch myInput
  switchControls is given

  switchControls.case "foo"
    doSomething
  switchControls.case "bar"
    doSomethingElse
  switchControls.default
    freakOut
```

With only trivial differences, the generated TypeScript would be
the same in both of these programs.

This language feature is generally only something used with blocks
passed literally in function calls, not with blocks defined as reusable functions.

## Returns

### Explicit Return (`return`)

The special function `return` in Thy explicitly returns a value from a block.

```thy
Chosen by fair dice roll.
Guaranteed to be random.
See https://xkcd.com/221/
return 4
```

### Early Return (`let`)

The `let` keyword in Thy enables early returns.

It's a common pattern in other C-like languages to do something like this:

```js
if (someEarlyReturnCondition) {
  return someEarlyValue
}
// Do the heavy lifting logic down here.
return fullValue
```

In Thy, `if` is a core standard library function instead of a keyword,
so `let` is necessary to allow this behavior:

```thy
let if someEarlyReturnCondition
  return someEarlyValue
Do the heavy lifting logic down here.
return fullValue
```

The `let` keyword in Thy is completely unrelated to TypeScript's `let` keyword
(Thy has `be`/`to` instead of TypeScript's `let`).
Instead, it would translate to TypeScript like this:

```js
const _tempResult23 = stdLib.if(someEarlyReturnCondition, () => {
  return someEarlyValue
})
if (_tempResult23 !== undefined) {
  return _tempResult23
}
// Do the heavy lifting logic down here.
return fullValue
```

The `let` keyword can delegate early returns to any arbitrary user-defined function,
but ultimately most `let` logic trees are going to terminate with some `let if` statement.

### Implicit Return (`export`/`private`)

If a block has no `return` or `let` statements,
it will return an object with properties from variables declared in the block.

```thy
a is def "A"
b is def 2
```

In this example, the block will return the object (formatted as JSON)
`{ "a": "A", "b": 2 }`.

The `export` and `private` keywords can be prepended to variable assignments
to explicitly determine whether variables are included in the implicit return.
The variable assignment still functions the same,
and the variable is still available either way in the block,
but the modifier will affect whether or not the variable is included
in the block return object.

The `export` keyword can be used to whitelist certain variables for return:

```thy
export a is def "A"
b is def 2
```

In this example, the block will return the object (formatted as JSON) `{ "a": "A" }`.

Conversely, the `private` keyword can be used to blacklist variables:

```thy
private a is def "A"
b is def 2
```

In this example, the block will return the object (formatted as JSON) `{ "b": 2 }`.

The `export` and `private` keywords can both be used in the same block,
but generally it makes sense to pick one and use that.

However, `export`/`private` is mutually exclusive with `return`/`let`. 
It is an error to use `return` or `let` in a block that uses `export`.

### No Return

If a block has at least one `let` statement but no `return` statement,
it may return `void` at the end.

> Capturing a `void` return value in a variable is undefined behavior
> and should be considered an error.

When a call returns `void`, it will not cause `let` at the call site
to effect an early return in the calling scope.

The `void` (no return) value in Thy is technically equivalent to
[`undefined` in TypeScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined).

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

Blocks may take some number of [parameters](#explicit-parameters-given)
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

## Strings

Strings are one of the primitive types in Thy.
Strings in Thy are equivalent to [strings in TypeScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String),
including all methods specified from ECMAScript.

## Numbers

Strings are one of the primitive types in Thy.
Strings in Thy are equivalent to [strings in TypeScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number),
including all methods specified from ECMAScript.

## Booleans

## Objects

## Blocks

## Asynchronous Code (`await`)

Asynchronous blocks in Thy are equivalent to [async arrow functions in TypeScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function).
Blocks are implicitly declared "async" (to use the term from TypeScript)
when they contain an `await` call.

The `await` function in Thy is equivalent to [`await` in TypeScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
with the exception that it is syntactically a function in Thy
rather than a keyword as in TypeScript.
