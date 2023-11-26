```thy
type T is Given Unknown
expression is given Unknown
type CallbackReturn is Union T Void
type Callback is def
  type CaseCallback is def
    type return CallbackReturn
  type SwitchControls is
    type CaseFunction is def
      compare is given Unknown
      callback is given CaseCallback
    type DefaultFunction is def
      callback is given CaseCallback
  controls is given SwitchControls
  type return CallbackReturn
callback is given Callback

type return CallbackReturn
```

This function is intended to feel like the `switch` control statement
from other C-like languages ([like TypeScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch)).

It is essentially equivalent to a large [`if`/`else`](#if) statement.
The input `expression` value is sequentially compared to each `compare` value
passed to `case` calls within the block.
If any `compare` value matches, that `case`'s block is run.
All other `case`'s will be skipped.
If no `case` is matched, the `default` block will be run.

If a `case` or `default` block is executed, the value returned from it
will be returned from that `case`/`default` call.

If a value is returned from `callback`, that value
will be returned from the `switch` call.

**Example:**

```thy
input is def "b"

switch input
  case "a"
    print "A!"
  case "b"
    print "B!"
  default
    print "None of those!"

output is switch input
  let case "a"
    return 1
  let case "b"
    return 2
  let default
    return 100
print output
```
