```thy
type T is Given Unknown
default is def
  let
init is given Function default

type return Array
```

Create a mutable array.

This function optionally takes an initialization block
which can be used to populate the array.

**Example:**

```thy
Create an empty array.
emptyArray is mutableArray
Add an element to it.
emptyArray.push 42

Create an array initialized with three elements.
arrayWith3 is mutableArray
  push 1
  push 2
  push 3
```
