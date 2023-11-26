```thy
type T is Given Unknown
value is given Unknown

type return T
```

Cast the value to a different type.

It only makes sense to call this function with an explicit type argument.

**Example:**

```thy
s is def "a string"
This b has the same value as s, but "is a boolean".
b is cast Boolean s
```
