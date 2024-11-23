foo is def
  type ExerciseFunc is def
    type Args is
      bar is def
        msg is given String
        return Void
    args is given Args
    return Void
  exercise is given ExerciseFunc
  o is
    bar is def print
  exercise o
  let

Above we can just accept as generated.
Below is what we really care about in this test.

foo
  foo
    if true
      foo
        foo
          bar "himom"
          let
        let
      foo
        print "himom"
        let
      let
    let
  let

foo
  foo
    bar "himom"
    foo
      print "himom"
      let
    let
  let

let
