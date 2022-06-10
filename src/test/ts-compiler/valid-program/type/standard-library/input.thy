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

type BasicUnion is Union String Number
type UnionWithValue is Union String unknownFunc
type NonTrivialUnion is Union String
  return "himom"
