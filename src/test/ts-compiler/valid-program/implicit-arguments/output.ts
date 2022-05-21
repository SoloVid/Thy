const foo = (exercise: (args: { bar: (msg: string) => void }) => void) => {
  exercise({ bar: console.log })
}

foo((_2L) => {
  const _2 = {..._2L, ...{}} as const
  foo((_3L) => {
    const _3 = {..._3L, ..._2} as const
    if (true) {
      foo((_4L) => {
        const _4 = {..._4L, ..._3} as const
        foo((_5L) => {
          const _5 = {..._5L, ..._4} as const
          _5.bar("himom" as const)
        })
      })
      foo(() => {
        console.log("himom" as const)
      })
    }
  })
})

foo((_7L) => {
  const _7 = {..._7L, ...{}} as const
  foo((_8L) => {
    const _8 = {..._8L, ..._7} as const
    _8.bar("himom" as const)
    foo(() => {
      console.log("himom" as const)
    })
  })
})
