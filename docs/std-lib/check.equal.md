```thy
a is given Unknown
b is given Unknown a
c is given Unknown b
d is given Unknown c

type return Boolean
```

Check if all of the supplied terms are the same
([strict equality](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality)).

**Example:**

```thy
a is getThing1
b is getThing2
c is getThing3
check.equal a b c
if that
  print "a, b, and c all the same"
```
