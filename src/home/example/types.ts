export const typesThy = `
TTT
(This TTT part is just a comment to aid understanding.)
TS:
interface MyType<T> {
  field1: number;
  field2: T[];
}
More strictly something like:
type MyType<T> = typeof (() => {
  return {
    field1: null as number,
    field2: [null as T],
  }
})()
TTT
type MyType is def
  type T is Given Unknown
  type Result is
    field1 be def Number
    type ArrayT is Array T
    field2 be def ArrayT
  type return Result

TTT
TS:
type Interfaces<
  X extends number,
  Y extends X[] = boolean[]
> = MyType<X> & YOtherType<Y>
TTT
type Interfaces is def
  type X is Given Number
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
  w be def String ""

  Constructor body.
  private q is def qq
  w to def we

  method is def
    x is given
    y is given
    type return Void
    print x
    print y

type NewThing is newThing
myNewThing is newThing
myNewThing.method
`