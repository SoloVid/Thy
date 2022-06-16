const one = "one" as const

namespace n.a.m.e {
  export const two = "two" as const

  export namespace a {
    export const three = "three" as const
    const four = "four" as const

  }

  export namespace a2 {
    const five = "five" as const
    export const six = "six" as const
    const seven = "seven" as const

  }

}
