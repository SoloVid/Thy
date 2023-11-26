```thy
type K is Given Unknown
type V is Given Unknown

type ReturnType is Map K V
type return ReturnType
```

Create a mutable map (implemented with [JavaScript Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)).

**Example:**

```thy
myMap is map String Number
myMap.set "a" 1
myMap.set "b" 2
myMap.get "a"
print that
```
