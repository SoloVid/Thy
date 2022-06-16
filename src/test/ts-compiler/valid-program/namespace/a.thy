one is def "one"

thy.scope "n.a.m.e"
  two is def "two"

  thy.scope "a"
    three is def "three"
    private four is def "four"

  thy.scope "a2"
    five is def "five"
    export six is def "six"
    private seven is def "seven"
