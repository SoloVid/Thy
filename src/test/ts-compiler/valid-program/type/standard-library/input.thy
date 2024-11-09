booleanFunc is def
  p is given Boolean
numberFunc is def
  p is given Number
stringFunc is def
  p is given String
unknownFunc is def
  p is given Unknown
voidFunc is def
  p is given Void

type BasicIntersection is All String Number
type BasicUnion is Some String Number
type UnionWithValue is Some String unknownFunc
type NonTrivialUnion is Some String
  return "himom"
