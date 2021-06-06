export const source = `
namespace blahBlah

  fun main
    Assign literal. const a = 5
    a is val 5
    Assign value. const b = a
    b is val a
    Assign function result. const c = calc(a, b)
    c is calc a b

    This is a comment
    condition1 is all c d
    condition2 is equal a b
    some condition1 condition2
    if that
      doThing a b c
      e is calc d
    and else
      doOtherThing

  for.times 10
    given i
    e is get arr i
    doBlah

  for.elements arr
    given element
    print element

  loop
    doWork yo
    condition is val true
    Keyword 'yield' allows a return from the called function to result in return from this function.
    yield if condition
      return

  switch myVal
    given case
    given default
    case 1 2 3
      doFirst
    case 4
      doOther
    default
      doFallback

  private async fun typedFun ReturnType
    given A pA
    given B pB pBDefault
    asyncAdd pA pB
    await that
    return pA plus pB

  export fun U generalizedFun RT U
    given AT U pA
    given BT U pB

  How to do conditional types? Maybe don't support?
  TS: type ConditionalType<T> = T extends A ? AImplication : BImplication
  type fun ConditionalType
    given T
    type Result is If T A AImplication BImplication
    return Result

  TypeScript: interface MyType<T> { field1: number; field2: T[]; }
  type fun MyType
    given T
    type field1 is Number
    type field2 is Array T

  TS type Interfaces<X extends number, Y extends X[] = boolean[]> = MyType<X> & YOtherType<Y>
  type fun Interfaces
    type X be Number
    given X
    Won't allow stuff to separate givens from top of fun, but needed here in typeFun.
    type Y be Array X
    type DefaultY is Array Boolean
    given Y DefaultY

    type MX is MyType X
    type OY is YOtherType Y
    type Result is All MX OY
    return Result

  Class definition. class Thing<T> implements Interfaces<T, Yo>
  fun T newThing Interfaces T Yo
    Constructor parameters.
    given Q qq
    given String we

    Class members.
    w be String

    Constructor body.
    private q is qq
    w to we

    field1 is get
      return 5
    and set
      given n
      doSet n

    Require 'export' or not? If default is to export everything, maybe that's fine because there is no type for the class.
    fun method Void
      given x
      given y
      print x
      print y

  Array initialization. const arr = []
  arr is newArray
  With values. const arr = [1, 2, 3]
  arr is newArray 1 2 3
  Array index write. arr[5] = "blah"
  set arr 5 .blah.
  Array index access. const el = arr[5]
  el is get arr 5

  Class instantiation. const obj = new MyClass(a, b)
  obj is newMyClass a b
  print obj.q

  My paradigm is trending toward requiring 'export' on everything in this block.
  Maybe I could make the rule that the default is to export everything unless some member is explicitly exported.
  Object literal. const lobj = { pa: a, pb: b, pc: { m: 5 } }
  lobj is
    pa is a
    pb is b
    pc is
      m is val 5

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
    given a
    given b
    given c
    print a
  and
    given x
    print x
  and d

  try
    doSomething
      throw .my error.
  and catch
    given e
    print e
  and finally
    print .*sigh*.
`