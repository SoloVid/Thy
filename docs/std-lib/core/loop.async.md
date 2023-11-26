Collection of loop functions (`elements`, `forever`, and `times`)
that logically function the same as their respective synchronous functions,
with the exception that they all return [promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
and await promises returned from the `callback` function
before executing the next iteration.

**Example:**

```thy
loop.times 10
  i is given
  print "start .i."
  delay 100
  await that
  print "end .i."
await that
```
