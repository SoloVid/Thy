TS a la import { hey as hey } from ...
hey is thy .blah.blah.hey.

thy.scope .blahBlah.blah.
  main is fun
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

  TS: type FunctionType = (pA: A) => ReturnType
  More strictly something like: type FunctionType = typeof makeFunction((pA: A): ReturnType => {})
  type FunctionType is fun
    given A pA
    type return ReturnType

  private typedFun is fun
    given A pA
    given B pB pBDefault
    type ReturnType is Promise InnerReturnType
    type return ReturnType
    asyncAdd pA pB
    await that
    return pA plus pB

  export generalizedFun is fun
    type given Unknown U
    given AT U pA
    given BT U pB
    type ReturnType is RT U
    type return ReturnType

  TS: type ConditionalType<T> = T extends A ? AImplication : BImplication
  type ConditionalType is fun
    type given Unknown T
    type Result is If T A AImplication BImplication
    type return Result

  This doesn't have a TS direct representation. Closest thing is: type ConditionalTypeAlias<T> = ConditionalType<T>
  type ConditionalTypeAlias is TypeFun ConditionalType
  TS: type ConditionalTypeInst = ConditionalType // no arguments passed
  type ConditionalTypeInst is ConditionalType

  TypeScript: interface MyInterface1 { field1: number; field2: string; }
  type MyInterface1 is
    field1 be Number
    field2 be String

  TypeScript: interface MyType<T> { field1: number; field2: T[]; }
  More strictly something like: type MyType<T> = typeof (() => { return { field1: null as number, field2: [null as T] } })()
  type MyType is fun
    type given Unknown T
    type Result is
      field1 be Number
      field2 be Array T
    type return Result

  TS type Interfaces<X extends number, Y extends X[] = boolean[]> = MyType<X> & YOtherType<Y>
  type Interfaces is fun
    type given Number X
    Won't allow non-type statements to separate givens from top of fun, but needed here in type fun.
    type YParent is Array X
    type DefaultY is Array Boolean
    type given YParent Y DefaultY

    type MX is MyType X
    type OY is YOtherType Y
    type Result is All MX OY
    type return Result

  Class definition. class Thing<T> implements Interfaces<T, Yo>
  newThing is fun
    type given Unknown T
    Constructor parameters.
    given Q qq
    given String we
    type ReturnType is Interfaces T Yo
    type return ReturnType

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

    method is fun
      given x
      given y
      type return Void
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
