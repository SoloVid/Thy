```thy
a is given Number
b is given Number default
c is given Number default
d is given Number default

type return Boolean
```

Check if all of the supplied terms are given in ascending order.
(Similar to the [less than (`<`) operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than).)

**Example:**

```thy
a is getValue1
b is getValue2
c is getValue3
check.asc a b c
if that
  print "a, b, and c are in ascending order"
```
