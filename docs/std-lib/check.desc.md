```thy
a is given Number
math.subtract a 1
b is given Number that
math.subtract b 1
c is given Number that
math.subtract c 1
d is given Number that

type return Boolean
```

Check if all of the supplied terms are given in descending order.
(Similar to the [greater than (`>`) operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Greater_than).)

**Example:**

```thy
a is getValue1
b is getValue2
c is getValue3
check.desc a b c
if that
  print "a, b, and c are in descending order"
```
