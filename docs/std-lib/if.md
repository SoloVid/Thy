```thy
type T is Given Unknown
type CallbackReturn is Union Void T
type Callback is def
  type return CallbackReturn
condition is given Boolean
trueCallback is given Callback
elseIndicator is given ElseLiteral null
falseCallback is given Callback default

type ReturnType is Union Void T
type return ReturnType
```

If `condition` is true, call `trueCallback` and return the result.
If `condition` is false, call `falseCallback` and return the result.

If `condition` is false and `falseCallback` is not given, nothing is returned.

**Example:**

```thy
Print different messages depending on if condition is true.
if condition
  print "condition is true"
and else
  print "condition is false"

Calculate multiply or divide depending on if shouldMultiply is true.
result is if shouldMultiply
  math.multiply a b
  return that
and else
  math.divide a b
  return that

Return null from this block if shouldEarlyReturn is true.
let if shouldEarlyReturn
  return null
```
