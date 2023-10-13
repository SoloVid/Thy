```thy
type T is Given Unknown
default is def
  let
init is given Function default

type return Array
```

Create an immutable array.

This function optionally takes an initialization block
which can be used to populate the array prior to it being frozen.

**Example:**

```thy
Create an empty array.
emptyArray is array

Create an array initialized with three elements.
arrayWith3 is array
  push 1
  push 2
  push 3
```
