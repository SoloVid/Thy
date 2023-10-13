```thy
type T is Given Unknown
type ArrayType is Array T
arr is given ArrayType
index is given Number

type return T
```

Get an array element at the specified index.
(Provides read property accessor in lieu of [JavaScript's bracket notation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors#bracket_notation).)

**Example:**

```thy
myArray is array
  push "A"
  push "B"
  push "C"
get myArray 1
Print B.
print that
```
