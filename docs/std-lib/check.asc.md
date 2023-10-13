```thy
a is given Number
math.add a 1
b is given Number that
math.add b 1
c is given Number that
math.add c 1
d is given Number that

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
