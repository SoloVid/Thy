import { lexer } from "./lexer"

export function runLexExample() {
    const lexingResult = lexer.tokenize(`
namespace blahBlah

fun main
  a is 5
  b is 6
  c is a gt b
  d is a lt b

  This is a comment
  if c and d or a is b
    doThing a b c
    e is calc d

fun typedFun ReturnType pA A pB B
  return pA plus pB

class MyClass
  q is 5
  w be String

  Constructor
  init qq we
    this.q is qq
    w is we
  fun method x y
    print x
    print y

Array initialization. const arr = []
arr is Array
Array index access. const el = arr[5]
el is arr at 5

Class constructor. const obj = new MyClass(a, b)
obj is MyClass a b
print obj.q

Object literal. const lobj = { pa: a, pb: b }
lobj is
  pa a
  pb b

Multiline comment. Do I want this? Could aid mobile dev significantly bc no comment out hotkey.
ZZZ
String literal. callMe("hey mom.", a, (a, b, c) => {
    ...
}, x => {
    ...
}, d)
ZZZ
NMC
  Other Comment
  NMC
callMe .hey mom... a
  given a b c
  print a
and
  given x
  print x
and d
`)

lexingResult.tokens.map(t => {return {
    image: t.image,
    tokenType: t.tokenType.name
}}).forEach(e => console.log(e))
console.error(lexingResult.errors)
}