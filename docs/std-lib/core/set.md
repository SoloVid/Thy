```thy
type T is Given Unknown
type ArrayType is Array T
arr is given ArrayType
index is given Number
value is given T

type return Void
```

Set an array element at the specified index.
(Provides write property accessor in lieu of [JavaScript's bracket notation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors#bracket_notation).)

Developers are discouraged from using this function
since accessing array elements by index is error-prone.

**Example:**

```thy
myArray is mutableArray
  push "A"
  push "B"
  push "C"
set myArray 1 "D"
Array now has the elements "A", "D", and "C".
```
