```thy
type T is Given Unknown
type CallbackReturn is Union Void T
type Callback is def
  i is given Number
  type return CallbackReturn
n is given Number
callback is given Callback

type ReturnType is Union Void T
type return ReturnType
```

Call `callback` `n` times, passing in the iteration number
(starting with `0`) as the first parameter.

If `callback` returns a value on any iteration,
the loop will terminate and that value will be returned from this function.

**Example:**

```thy
loop.times 10
  i is given
  print "This is iteration .i."

stopAt is def 5
result is loop.times 10
  i is given
  check.equal i stopAt
  let if that
    return i
Print 5
print result
```
