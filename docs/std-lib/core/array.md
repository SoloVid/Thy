```thy
type T is Given Unknown
init is given Function default

type ReturnType is Array T
return ReturnType
```

Create a mutable array
(implemented with [JavaScript Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array);
typed as `T[]`).

This function optionally takes an initialization block
which can be used to populate the array.

If no `init` function is provided, an empty array will be created.

> Developers are discouraged from using this function
> since immutable data structures are typically less error-prone.

**Example:**

```thy
Create an empty array.
emptyArray is array
Add an element to it.
emptyArray.push 42

Create an array initialized with three elements.
arrayWith3 is array
  push 1
  push 2
  push 3
```
