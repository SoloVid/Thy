booleanFunc is def
  p is given Boolean
  let
numberFunc is def
  p is given Number
  let
stringFunc is def
  p is given String
  let
unknownFunc is def
  p is given Unknown
  let
voidFunc is def
  p is given Void
  let

type BasicIntersection is All String Number
type BasicUnion is Some String Number
type UnionWithValue is Some String unknownFunc
type NonTrivialUnion is Some String
  return "himom"
