```thy
type T is Given Unknown
value is given T

type return T
```

Return the value.

This built-in function provides an easy way to sidestep
the problem in Thy where every variable declaration/assignment
requires a function call.

The technical difference between this function and `cast`
is that `cast` *unsafely* casts the value.

**Example:**

```thy
Define a string value.
s is def "a string"
Define a function.
f is def
  message is given String
  print message

Call the function (for completeness).
f s
```
