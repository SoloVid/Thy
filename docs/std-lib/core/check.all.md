```thy
a is given Boolean
b is given Boolean true
c is given Boolean true
d is given Boolean true

type return Boolean
```

Check if all of the supplied terms are true
([logical AND (`&&`) operation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND)).

**Example:**

```thy
a is getCondition1
b is getCondition2
c is getCondition3
check.all a b c
if that
  print "a, b, and c all true"
```
