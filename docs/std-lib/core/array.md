```thy
type T is Given Unknown
init is given Function default

type ReturnType is Array T
type return ReturnType
```

Create an immutable array 
(implemented with [JavaScript Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array);
typed as `readonly T[]`).

This function optionally takes an initialization block
which can be used to populate the array prior to it being frozen.

If no `init` function is provided, an empty array will be created.

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
