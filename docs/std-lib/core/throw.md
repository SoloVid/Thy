```thy
message is given String

type return Void
```

Throw an exception to be caught by (`try`/`catch`)[#try].

This is equivalent to [`throw new Error(message)` in TypeScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw).

**Example:**

```thy
if someErrorCondition
  throw "Hit an error! .someDetails."
```
