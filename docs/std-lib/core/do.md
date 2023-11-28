```thy
type T is Given Unknown
type Callback is def
  type return T
callback is given Callback

type return T
```

Execute the `callback` function and return the value.

This built-in function provides an easy way to immediately invoke a block
in a bare-call statement.

Most of the time this function is superfluous with just immediately
invoking a block as part of an assignment or a `let` statement.

**Example:**

```thy
do
  a is def 1
  b is def 2
  c is def 3
  math.add a b c
  print that
  let
```
