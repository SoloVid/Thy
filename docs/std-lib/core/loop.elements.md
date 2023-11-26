```thy
type T is Given Unknown
type U is Given Unknown
type InputArray is Array T
type CallbackReturn is Union Void U
type Callback is def
  element is given T
  i is given Number
  type return CallbackReturn
arr is given InputArray
callback is given Callback

type ReturnType is Union Void U
type return ReturnType
```

Call `callback` for each element in array `arr`,
passing in the element as the first parameter and
the iteration number (starting with `0`) as the second parameter.

If `callback` returns a value on any iteration,
the loop will terminate and that value will be returned from this function.

**Example:**

```thy
arr is array
  push 1
  push 2
  push 3

loop.elements arr
  e is given
  i is given
  print "Element .i. is .e."

stopAt is def 2
result is loop.times 10
  e is given
  i is given
  check.equal e stopAt
  let if that
    return i
Print 1
print result
```
