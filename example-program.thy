TS a la `import { heya as hey } from ...`
hey is thy "blah.blah.heya"

TS a la `namespace blahBlah.blah`
thy.scope "blahBlah.blah"
  Define a function.
  main is def
    Assign literal. const a = 5
    a is def 5
    Assign value. const b = a
    b is def a
    Assign function result. const c = calc(a, b)
    c is calc a b
    Just call function
    print "himom"

    This is a comment
    check.all c d
    compare.equal a b
    check.some beforeThat that
    if that
      doThing a b c
      e is calc d
    and else
      doOtherThing

  for.times 10
    i is given
    e is get arr i
    doBlah

  for.elements arr
    element is given
    print element

  loop
    doWork yo
    condition is def true
    Keyword 'yield' allows a return from the called function to result in return from this function.
    yield if condition
      return

  switch myVal
    case 1 doFirst
    case 2
      doFirst
    case 3 doFirst
    case 4
      doOther
    default
      doFallback

  TS: type FunctionType = (pA: A) => ReturnType
  More strictly something like: type FunctionType = typeof makeFunction((pA: A): ReturnType => {})
  type FunctionType is def
    pA is given A
    type return ReturnType

  private typedFun is def
    pA is given A
    pB is given B pBDefault
    type ReturnType is Promise InnerReturnType
    type return ReturnType
    asyncAdd pA pB
    await that
    return pA plus pB

  export generalizedFun is def
    type U is Given Unknown
    type ATU is AT U
    pA is given ATU
    type BTU is BT U
    pB is given BTU 
    type ReturnType is RT U
    type return ReturnType

  TS: type ConditionalType<T> = T extends A ? AImplication : BImplication
  type ConditionalType is def
    type T is Given Unknown
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
  type MyType is def
    type T is Given Unknown
    type Result is
      field1 be Number
      field2 be Array T
    type return Result

  TS type Interfaces<X extends number, Y extends X[] = boolean[]> = MyType<X> & YOtherType<Y>
  type Interfaces is def
    type X is Given Number
    Won't allow non-type statements to separate givens from top of fun, but needed here in type fun.
    type YParent is Array X
    type DefaultY is Array Boolean
    type Y is Given YParent DefaultY

    type MX is MyType X
    type OY is YOtherType Y
    type Result is All MX OY
    type return Result

  Class definition. class Thing<T> implements Interfaces<T, Yo>
  newThing is def
    type T is Given Unknown
    Constructor parameters.
    qq is given Q
    qe is given String
    type ReturnType is Interfaces T Yo
    type return ReturnType

    Class members.
    w be String ""

    Constructor body.
    private q is qq
    w to we

    field1 is getter
      return 5
    and setter
      n is given
      doSet n

    method is def
      x is given
      y is given
      type return Void
      print x
      print y

  Array initialization. const arr = []
  arr is array
  With values. const arr = [1, 2, 3]
  arr is array
    a is given
    a 1
    a 2
    a 3
  Array index write. arr[5] = "blah"
  set arr 5 "blah"
  Array index access. const el = arr[5]
  el is get arr 5

  Class instantiation. const obj = new MyClass(a, b)
  obj is newMyClass a b
  print obj.q

  Object literal. const lobj = { pa: a, pb: b, pc: { m: 5 } }
  lobj is
    pa is a
    pb is b
    pc is
      m is def 5

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
  callMe "hey mom." a
    a is given
    b is given
    c is given
    print a
  and
    x is given
    print x
  and d

  try
    doSomething
      throw "my error"
  and catch
    e is given
    print e
  and finally
    print "*sigh*"
