I mean to provide a helper function that just returns the argument.
For example `a is 5` is invalid.

Def

a is def 5
b is def a
c is def
  x is runCalc a b
  y is def null
d is def
  p is given Number
  return p

This

a is this 5
b is this a
c is this
  x is runCalc a b
  y is this null
d is this 
  p is given Number
  return p

Just

a is just 5
b is just a
c is just
  x is runCalc a b
  y is just null
d is just
  p is given Number
  return p

Lit

a is lit 5
b is lit a
c is lit
  x is runCalc a b
  y is lit null
d is lit
  p is given Number
  return p