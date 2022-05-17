const foo = (exercise: (args: { bar: (msg: string) => void }) => void) => {
  exercise({ bar: console.log })
}

foo((_1) => {
  const _2 = {..._1} as const
  foo((_3) => {
    const _4 = {..._3, ..._2} as const
    if (true) {
      foo((_5) => {
        const _6 = {..._5, ..._4} as const
        foo((_7) => {
          const _8 = {..._7, ..._6} as const
          _8.bar("himom")
        })
      })
      foo(() => {
        console.log("himom")
      })
    }
  })
})

foo((_9) => {
  const _10 = {..._9} as const
  foo((_11) => {
    const _12 = {..._11, ..._10} as const
    _12.bar("himom")
    foo(() => {
      console.log("himom")
    })
  })
})
