
## Open Questions

- How to allow rest parameters / var-args / whatever other languages call them?
    - This is necessary at least because of how if/else will be implemented.
    - DECISION: Don't allow rest parameters. Forget about elseif. if/else can just be if + optional params for else.
- Will it be a problem to have the same built-in functions (e.g. `if`) to support async and sync usage?
    - Compiling to TypeScript problem? No.
    - Language purity? Undecided.
- Possibly related to previous question about `if`, allow method overloading and/or union types?
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
- typeFun? This is pretty complex, but it could be simple and powerful as a language feature.
- ES properties (getter/setter)?
- async functions
    - Should blocks be automatically detected as async? I'm currently leaning yes.
    - Should async functions be explicitly marked? I'm currently leaning yes.
    - Should async function be typed with Promise<X>? I'm currently leaning no.
- TypeScript interoperability
    - Should interoperability go both ways? Or just one way?
- Should `await` be special syntactically?
    - Special: `myVar is await myFunc arg`
    - Not special: `waitForMyFunc is myFunc arg // myVar is await waitForMyFunc`?
        - If it isn't special, it might absolve the desire for distinction between `defer` and `yield`
        - `defer await myFunc arg` would not be allowed, so the limit would be `defer await waitForMyFunc`
    - DECISION: not special
- Should `new` be a special function for interoperability with TypeScript?
    - I'd like this to be no, but I'm not sure if that significantly drops the usability of this language.
    - Primary alternative is to support a conventional `newBlah` naming scheme that maps one-to-one with TypeScript class instantiation.
- Should capitalized scopes be allowed?
    - TypeScript code might expose static class methods or capitalized namespaces.
    - Should this language support accessing those?

## Overview of Language Strategy

### Simple

- Every level is just a block of code
- Every (almost) operation is just a function call

## Reserved Words

### Syntactically Reserved

These keywords need to be recognized by the lexer since they are part of the language grammar.

- and - continues function call on new line
- async - modifier for fun
- be - denotes preceding identifier as not a function call
- export - modifier for fun and declarations
- fun - type parameters plus return type requires special syntax not supported by function call
- is - denotes preceding identifier as not a function call
- type - type-related operations just start breaking the standard language stuff
- yield - unlike standard function calls, this can (and must) precede another function call on the same line

### Language Feature Functions

These "functions" allow non-special grammar, but their behavior is significantly different from functions you can write in this language.

- await - affects standard language control flow
- given - not really a runtime call
- return - affects standard language control flow
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
- namespace - function
- null - value
- switch - function
- true - value
- try - function
- val - function

### Reserved Type Names

- Array (1 type parameter)
- Bool/Boolean (which? both?)
- Null
- Number
- String
- Unknown
- Void

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

    aIsNull is equal a null
    if aIsNull
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
    const aIsNull = a === null
    if (aIsNull) {
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

## Parameters

### Optional Parameters

Optional parameters can be specified by passing two values to `given` (second being the default).

TypeScript can handle this with a simple `= <default value>` tacked onto the parameter declaration.

Unlike TypeScript, don't allow explicit forcing of default value by passing something like undefined.
