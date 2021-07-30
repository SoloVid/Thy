
## Open Questions

- How to handle imports?
    - Stick with implicit used by splitTime at present?
    - Use `given` for some explicit importing?
        - `given` largely relies on order in blocks, but that doesn't make so much sense for imports.
        - Top-level imports could require types, but we don't readily have types available.
- Names for built-in functions?
    - Arrays
        - new array - `newArray`? `array`? `arr`? `a`?
        - array access - `get myArr 3`?
        - array element set - `set myArr 3 myVal`?
    - Comparators - may just want these all to be `compare.xxx`
        - equivalence - `compare.equal`?
        - less than / greater than - `compare.asc`/`compare.desc`?
    - Logic
        - and / or - `all` / `some`?
        - not - `not`
    - Math - may just want these all to be `math.xxx`
        - add / subtract
        - multiply / divide / mod
        - exponent?
- What happens when you put non-type implementation in a TypeFun?
    - Compiler error?

## Overview of Language Strategy

### Simple

- Every level is just a block of code
- Every (almost) operation is just a function call

A function call looks like `functionName [TypeArgument ...] [argument ...]`.
Every argument must be a single term.

## Reserved Words

### Syntactically Reserved

These keywords need to be recognized by the lexer since they are part of the language grammar.

- and - continues function call on new line
- be - denotes preceding identifier as not a function call
- export - modifier for fun and declarations
- is - denotes preceding identifier as not a function call
- private - modifier for fun and declarations
- to - denotes preceding identifier as not a function call
- type - type-related operations just start breaking the standard language stuff
- yield - unlike standard function calls, this can (and must) precede another function call on the same line

### Language Feature Functions

These "functions" allow non-special grammar, but their behavior is significantly different from functions you can write in this language.

- await - affects standard language control flow
- fun - define a function
- get - array access or define as getter
- given - not really a runtime call
- return - affects standard language control flow
- set - array mutate or define as setter
- throw - affects standard language control flow

### Reserved Value Names

These values/functions operate a lot like stuff you can write in this language, but they are still special and provided by the compiler/runtime.

- catch - sentinel value argument for try
- else - sentinel value argument for if
- false - value
- finally - sentinel value argument for try
- for - container for for-loop functions
- if - function
- loop - function
- null - value
- switch - function
- thy - function / value
- true - value
- try - function
- val - function

### Reserved Type Names

- Array (1 type parameter)
- Bool/Boolean (which? both?)
- If (4 type parameters)
- Null (0 or 1 type parameters)
- Number
- String
- TypeFun
- Unknown
- Void

## Building Blocks

These are the fundamental building blocks of the language:

- Code blocks
- Values
- Types

### Code Blocks

A code block is a section of code delimited by indentation.
It can be `given` types and values and return a single value along with any number of types.

### Values

Values, variables. Tomato, potato.

### Types

Types are purely a compile-time aid for static code analysis.

Types can be used in three places:
- `type` statements
- Variable declarations (`be`)
- Function calls (as type arguments)

## Return values

### Early Returns (defer / yield)
I really want to make `if` a function in this language.
It takes a condition, a function, and additional else-related stuff.
One common paradigm this makes difficult is early returns:

```typescript
    if (condition) {
        return earlyValue;
    }
    ... // continue on
```

So I have this idea to have a `defer` keyword:

```moby
defer if condition
    return earlyValue
... Continue on
```

Here's what I've come up with to make this work.
A function can have a return type of any normal type (including Null or Null+ types)
and/or a special Void type.

```moby
type MyNullableType is Null MyType
type SplitPathReturn is Void MyNullableType
fun splitPath SplitPathReturn
    defer if condition
        This is short for `return null`.
        return
    doSomethingCool
    There is an implicit void return here that translates to TS `return` or `return undefined`.
```

But variables cannot hold a value of type Void. `defer` is the only part of the language with access to it.
```moby
given a Fun VoidableNullableType

Execute the function and either return NullableType or continue (if void was returned).
defer a
Execute the function and store NullableType into aa (void coalesces to null).
aa is a
```

`yield` is intended to be shorthand for `defer await`.

### Classes
I also really want classes and object literals to follow the same rules as other code for blocks.
This has led me to the following set of rules:
- Every indentation level of the program has the same rules.
- Every block (and these rules only require evaluating at the single indentation level) has some return value/type.
    - If a block uses `return`, `defer`, or `yield`, it will only return the types of the returned/deferred/yielded functions (plus Void if the last statement of the block is not a `return` statement).
    - If a block uses `export` (on a function or variable), it will return an object containing members of all exported declarations.
    - If a block meets neither of the above criteria, it will return an object with all declarations exported. (Might add some allowance for black-listing (maybe `hidden` (6 letters matches export) or `private` (more standard)?) instead of only the previous option of whitelisting.)
    - (It is an error to use `export` with `return`/`defer`/`yield`.)

#### Consequence #1: Object Literals
```moby
myObj is
    field1 is val 1
    field2 is
        a is val .himom.
```

This most strictly translates to the following TypeScript:
```typescript
const myObj = (() => {
    const field1 = 1
    const field2 = (() => {
        const a = "himom"
        return { a }
    })()
    return { field1, field2 }
})()
```
But it could be optimized to the more colloquial TypeScript:
```typescript
const myObj = {
    field1: 1,
    field2: {
        a: "himom"
    }
}
```

#### Consequence #2: Classes
```moby
fun newThing Thing
    given a NullableA

    aa be A

    compare.equal a null
    if that
        aa is newA
    and else
        aa is a

    fun printA Void
        console.log aa
```

This fairly strictly translates to the following TypeScript:
```typescript
function newThing(a: NullableA): Thing {
    let aa: A
    if (a === null) {
        aa = newA()
    } else {
        aa = a
    }

    function printA(): void {
        console.log(aa)
    }

    return { aa, aIsNull, printA }
}
```
But it could be optimized to the more colloquial TypeScript:
```typescript
class ThingImpl implements Thing {
    aa: A

    constructor(a: NullableA) {
        if (a === null) {
            this.aa = new A()
        } else {
            this.aa = a
        }
    }

    printA(): void {
        console.log(this.aa)
    }
}
```

Notice that the class case exposes some extra fields by default in the return value,
but this isn't a problem because we aren't allowing the class itself
to function as both an implementation and a type (as most languages I know do),
so consumers can't access those extra fields (at least in a statically typed fashion).
It could be a future optimization to actually remove them so they aren't present at runtime.

I think the name clash should just be disallowed. e.g. `fun newThing Thing` would throw compiler error
because we don't want to create a class called `Thing` that clashes with the type `Thing`.
Dynamically picking some alternative name will just either make our lives harder or cause a different collision.

Unfortunately, classes and closures are not equivalent in ECMAScript.
Namely, functions in the closure case (which is logically what's happening in this language) do not have `this`.
In ECMAScript, functions have a bound `this` which comes from the pre-dot part in a function call.
When you pass a method as a function value, it won't have this bound.

```moby
fun newMyClass
    myField is 5
    fun myMethod
        print myField
inst is newMyClass
Expect print 5.
call inst.myMethod
```
should translate to
```typescript
class MyClass {
    myField = 5
    myMethod() {
        print(this.myField)
    }
}
const inst = new MyClass()
// Would print undefined.
call(inst.myMethod)
```
but is more literally
```typescript
function newMyClass() {
    let myField = 5
    function myMethod() {
        print(myField)
    }
    return { myField, myMethod }
}
const inst = newMyClass()
// Would print 5.
call(inst.myMethod)
```

I think the solution here long-term may be to call bind at the call site for the limited cases this happens.
```typescript
call(inst.myMethod.bind(inst))
```
though this has the side effect that you can't compare two such functions.
This also requires type-aware context to pull off at the call site.

An easier short-term solution I think may be something like just ignoring this problem,
but I'd like to be able to clearly document what the rule here is,
and I'd like that rule not to be divergent depending on whether you use `newBlah` or `makeBlah` as a function name.

## Interfile Dependencies

Namespaces are the primary means of dependency management in this language.

Logically, a call to the `namespace` "function" does a couple things:
- Declare part of a namespace object by name within the current scope.
- Run the code inside the block some time (no guarantees when it will be run except that it will be run after the preceding non-namespace statements).
- Run the block with correct dependencies injected after they are available.
- Provide the partial namespace object to the calling context.

WIP: Haven't quite thought through everything here yet.

```moby
File one.moby

thy.scope .my.space.
    a is fun
        print .himom.
```

```moby
File two.moby

thy.scope .my.space.
    b is fun
        print .hello.
```

```moby
File three.moby

a is thy .my.space.a.
b is thy .my.space.b.

a
b
```

If we wanted just a single moby file compiled from these, I believe the result could be:
```moby
thy.scope .global.
    given thy
    thy.scope .my.space.
        fun a
            print .himom.
thy.scope .global.
    given thy
    thy.scope .my.space.
        fun b
            print .hello.
thy.scope .global.
    given thy
    a is thy .my.space.a.
    b is thy .my.space.b.
    a
    b
```

## Parameters

### Optional Parameters

Optional parameters can be specified by passing two values to `given` (second being the default).

TypeScript can handle this with a simple `= <default value>` tacked onto the parameter declaration.

Unlike TypeScript, don't allow explicit forcing of default value by passing something like undefined.

## Getter/Setter (ES properties)

Getter/setter from TypeScript should be fully usable regardless.

Here is a somewhat-minimally language-wrecking implementation for getter/setter pattern.

```moby
fun newMyClass MyInterface
    getSetField1 is get
        return 4
    and set
        given n
        doSet n

    getSetField2 is set
        given n
        doSet n
    and get
        return 4
```

```typescript
class MyClass implements MyInterface {
    get getSetField1() {
        return 4
    }
    set getSetField1(n) {
        doSet(n)
    }

    set getSetField2(n) {
        doSet(n)
    }
    get getSetField2() {
        return 4
    }
}
```
