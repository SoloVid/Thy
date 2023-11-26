```thy
Milliseconds to wait
ms is given Number

def null
await that

type return Void
```

Return a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
that resolves after `ms` milliseconds.

**Example:**

```thy
print "Waiting 1.5 seconds"
delay 1500
await that
print "Done!"
```
