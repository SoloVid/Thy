```thy
type T is Given Unknown
type TryBlock is def
  type return T
tryBlock is given TryBlock
catchOrFinally is given CatchOrFinally
type SecondBlock is def
  e is given Unknown
  type SecondBlockReturn is Union T Void
  type return SecondBlockReturn
secondBlock is given SecondBlock

type return T
```

This function is intended to feel like the `try` control statement
from other C-like languages ([like TypeScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch)).

The function always executes the `tryBlock` callback first.
If the `tryBlock` successfully returns a value,
it will be returned from the `try` call.

The function can be called in two variants: `catch` and `finally`.

When called with [`catch`](#catch) as the second argument,
the `secondBlock` will be executed if the `tryBlock` [throws](#throw) an exception.
The thrown exception will be passed to the `secondBlock` as the first parameter.
If the `secondBlock` returns a value, it will be returned from the `try` call.
Otherwise, the caught exception will be rethrown.
(Note: It is also an option for the `secondBlock` to [throw](#throw) a new exception.)

When called with [`finally`](#finally) as the second argument,
the `secondBlock` will always be executed after the `tryBlock` finishes,
whether it finishes by returning or by throwing.
[`null`](#null) will be passed to the `secondBlock` as the first parameter.
If the `secondBlock` returns a value, it will be returned from the `try` call.
Otherwise, the result of the `tryBlock` will be propagated.
(Note: It is also an option for the `secondBlock` to [throw](#throw) a new exception.)

> `catch` blocks should be used sparingly
> (generally only at the highest levels of your program).
> It is an anti-pattern to use exceptions as a control flow mechanism
> for passing data up the stack.

**Example:**

```thy
try
  doSomethingThatMightThrow
and catch
  e is given
  print "Oh noes! We hit an exception!"
  print e
  return null

myResource is allocateSomeResource
try
  doSomethingWithResource myResource
and finally
  cleanupResource myResource

result is try
  doSomethingDangerous
  return that
and catch
  return "nope"
print result
```
