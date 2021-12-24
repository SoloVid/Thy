
## Open Questions

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

## Overview of Language Strategy

- No special characters
- Naturalness (compared to mainstream programming)
- Strong static types
- Simple compiler
- Simple rules
- Encourage good programming practices

### No Special Characters

The only symbol that is syntactically special is `.`.
Everything else is done with letters (and numbers if desired).

### Strong Static Types

TypeScript has a pretty solid type system.
Null safety and disallowance of `any` take the system further.
Thy should support most common (and good practice) patterns of types in TypeScript.
This includes (but is not necessarily limited to):
- Explicit and implicit typing
- Union and intersection types
- Parameterized types
- Structural typing

### Simple Compiler

I don't want to write a full blown compiler.
The plan is to just compile to TypeScript and let tsc take it from there.
I'm mainly trying to avoid writing a type-checker.

Implications:
- A language feature cannot require type information (from elsewhere) to determine what TS should be generated.

### Simple Rules

I want Thy to be simple both because it will be easier to implement/maintain and because it will be easier to learn.

- Every level is just a block of code
- Every (almost) operation is just a function call

A function call looks like `functionName [TypeArgument ...] [argument ...]`.
Every argument must be a single term.

#### Affordances

`that` refers to the returned value from the function call of immediately preceding line.
It effectively inlines that call unless `that` is used twice in the same line.
`that` results in a compile error if the preceding line is not just a function call
(e.g. assignment or start of block).
Because binary operations are so common, `beforeThat` is provided to go one more line back.

### Encourage Good Programming Practices

- Immutable by default
    - Note to self: This includes arrays. I'll probably have an alternative like arrayMutable. May use `as const` at call site?
- No variable name ghosting
    - Note to self: Compiler error for this.
- No classes
- No inheritance
- Targeted loop interfaces (e.g. no while/do-while, no awkward for(...;...;...) loop)
- Switch cases don't fall through
- `break` is replaced by more uniform interface (let/return)

## Reserved Words

### Syntactically Reserved

These keywords need to be recognized by the lexer since they are part of the language grammar.

- and - continues function call on new line
- be - denotes preceding identifier as not a function call
- export - modifier for declarations
- is - denotes preceding identifier as not a function call
- private - modifier for declarations
- to - denotes preceding identifier as not a function call
- type - type-related operations just start breaking the standard language stuff
- let - unlike standard function calls, this can (and must) precede another function call on the same line

### Language Feature Functions

These "functions" allow non-special grammar.
Their usage is significantly different from functions you can write in this language.

- await - affects standard language control flow
- given - not really a runtime call
- return - affects standard language control flow
- throw - affects standard language control flow

### Reserved Value Names

These values/functions have an interface like stuff you can write in thy,
but you couldn't actually implement them in thy.

- array - define an array
- arrayMutable - define a mutable array
- beforeThat - context-dependent value
- catch - sentinel value argument for try
- else - sentinel value argument for if
- false - value
- finally - sentinel value argument for try
- get - array access
- getter - define as getter
- if - function
- loop - function
- null - value
- set - array mutate
- setter - define as setter
- switch - function
- that - context-dependent value
- thy - function / value
- true - value
- try - function
- val - function

### Reserved Type Names

- Array (1 type parameter)
- ArrayMutable (1 type parameter)
- Bool
- If (4 type parameters)
- Null (0 or 1 type parameters)
- Number
- String
- Unknown
- Void

### Other Provided Stuff

- check
    - all - logical AND
    - some - logical OR
- compare
    - asc - less than
    - desc - greater than
    - equal
- def - shorthand function that returns the value of the first argument
- for - container for for-loop functions
    - elements
    - times
- math
    - add
    - subtract
    - multiply
    - divide

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

### Early Returns (let)
I really want to make `if` a function in this language.
It takes a condition, a function, and additional else-related stuff.
One common paradigm this makes difficult is early returns:

```typescript
    if (condition) {
        return earlyValue;
    }
    ... // continue on
```

So I have this idea to have a `let` keyword:

```thy
let if condition
    return earlyValue
... Continue on
```

Here's what I've come up with to make this work.
A function can have a return type of any normal type (including Null or Null+ types)
and/or a special Void type.

```thy
splitPath is def
    type MyNullableType is Null MyType
    type SplitPathReturn is Void MyNullableType
    type return SplitPathReturn
    let if condition
        return null
    doSomethingCool
    There is an implicit void return here that translates to TS `return` or `return undefined`.
```

But variables cannot hold a value of type Void. `let` is the only part of the language with access to it.
```thy
type A is def
    type return VoidableNullableType
given A a

Execute the function and either return NullableType or continue (if void was returned).
let a

Assigning the return value of the function call to a variable is undefined behavior.
In the future, I would want to make this a type error.
X aa is a
```

### Classes
I also really want classes and object literals to follow the same rules as other code for blocks.
This has led me to the following set of rules:
- Every indentation level of the program has the same rules.
- Every block (and these rules only require evaluating at the single indentation level) has some return value/type.
    - If a block uses `return` or `let`, it will only return the types of the returned/leted functions (plus Void if the last statement of the block is not a `return` statement).
    - If a block uses `export` (on a function or variable), it will return an object containing members of all exported declarations.
    - If a block meets neither of the above criteria, it will return an object with all declarations exported.
        - `private` provides a black-listing alternative to `export`.
    - (It is an error to use `export` in the same block with `return`/`let`.)

#### Consequence #1: Object Literals
```thy
myObj is
    field1 is def 1
    field2 is
        a is def .himom.
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
```thy
newThing is def
    type return Thing
    given NullableA a

    compare.equal a null
    aa be A if that
        return newA
    and else
        return a

    printA is def
        type return Void
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
so consumers can't access those extra fields as easily.
It could be a future optimization to actually remove them so they aren't present at runtime.

I think the name clash should just be disallowed. e.g. `fun newThing Thing` would throw compiler error
because we don't want to create a class called `Thing` that clashes with the type `Thing`.
Dynamically picking some alternative name will just either make our lives harder or cause a different collision.

Unfortunately, classes and closures are not equivalent in ECMAScript.
Namely, functions in the closure case (which is logically what's happening in this language) do not have `this`.
In ECMAScript, functions have a bound `this` which comes from the pre-dot part in a function call.
When you pass a method as a function value, it won't have `this` bound.

```thy
newMyClass is def
    myField is def 5
    myMethod is def
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

```thy
File one.thy

thy.scope .my.space.
    a is fun
        print .himom.
```

```thy
File two.thy

thy.scope .my.space.
    b is fun
        print .hello.
```

```thy
File three.thy

a is thy .my.space.a.
b is thy .my.space.b.

a
b
```

If we wanted just a single thy file compiled from these, I believe the result (which should be able to work at runtime) could be:
```thy
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

### Rest Parameters

Rest parameters are not provided in thy.

## Getter/Setter (ES properties)

Getter/setter from TypeScript should be fully usable.

Here is a somewhat-minimally-language-wrecking implementation for getter/setter pattern.

```thy
fun newMyClass MyInterface
    getSetField1 is getter
        return 4
    and setter
        given n
        doSet n

    getSetField2 is setter
        given n
        doSet n
    and getter
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
