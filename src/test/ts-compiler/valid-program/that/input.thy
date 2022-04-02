math.add 1 1
math.multiply 1 1
math.divide beforeThat that
check.equal that 1
console.log that

makeFunctionFunction is def
  a is given Number
  return
    b is given Number
    return
      c is given Number
      check.asc a b c
      return that

Calling that: const result = makeFunctionFunction(1)(2)(3)
makeFunctionFunction 1
that 2
result is that 3
