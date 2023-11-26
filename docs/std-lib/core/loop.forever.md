```thy
type T is Given Unknown
type CallbackReturn is Union Void T
type Callback is def
  type return CallbackReturn
callback is given Callback

type ReturnType is Union Void T
type return ReturnType
```

Call `callback` over and over again indefinitely.

If `callback` returns a value on any iteration,
the loop will terminate and that value will be returned from this function.

**Example:**

```thy
let loop.forever
  let if someConditionMet
    return null

i be def 0
stringSoFar be def ""
builtString is loop.forever
  stringSoFar to def ".stringSoFar..i."
  i to math.add i 1
  check.asc 100 stringSoFar.length
  let if that
    return stringSoFar
print builtString
```
