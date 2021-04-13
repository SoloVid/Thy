import { lexer } from "./lexer"

export function runLexExample() {
    const lexingResult = lexer.tokenize(`
fun main
  a is 5
  b is 6
  c is a gt b
  d is a lt b
  
  This is a comment
  if c and d or a is b
    doThing a b c
    e is calc d

class MyClass
  q
  w
  init qq we
    q is qq
    w is we
  fun method x y
    print x
    print y

arr is array
el is ar.5

obj is MyClass a b
print obj.q

callMe .hey mom. a
  given a b c
  print a
and
  given x
  print x
and d
`)

console.log(lexingResult.tokens.map(t => {return {
    image: t.image,
    tokenType: t.tokenType.name
}}))
console.error(lexingResult.errors)
}